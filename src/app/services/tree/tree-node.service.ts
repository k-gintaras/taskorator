import { Injectable } from '@angular/core';
import { ROOT_TASK_ID, TaskoratorTask } from '../../models/taskModelManager';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TaskTreeNodeToolsService } from './task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeService {
  constructor(private treeTools: TaskTreeNodeToolsService) {}

  async createTasks(
    tree: TaskTree,
    tasks: TaskoratorTask[]
  ): Promise<string[]> {
    // Validate input
    if (!tasks || !Array.isArray(tasks)) {
      console.warn('[TreeNodeService] Invalid tasks input for createTasks');
      return [];
    }

    const uniqueTasks = this.deduplicateTasks(tasks);
    const created: string[] = [];

    for (const task of uniqueTasks) {
      if (await this.createOrUpdateTask(tree, task, 'create')) {
        created.push(task.taskId);
      }
    }

    return created;
  }

  async updateTasks(
    tree: TaskTree,
    tasks: TaskoratorTask[]
  ): Promise<string[]> {
    // Validate input
    if (!tasks || !Array.isArray(tasks)) {
      console.warn('[TreeNodeService] Invalid tasks input for updateTasks');
      return [];
    }

    const updated: string[] = [];

    for (const task of tasks) {
      if (await this.createOrUpdateTask(tree, task, 'update')) {
        updated.push(task.taskId);
      }
    }

    return updated;
  }

  async deleteTasks(tree: TaskTree, taskIds: string[]): Promise<string[]> {
    const deleted: string[] = [];

    for (const taskId of taskIds) {
      const node = this.treeTools.findNodeById(tree.primarch, taskId);
      if (!node) continue;

      this.orphanChildren(node);
      this.removeNodeFromParent(tree, node);
      this.removeFromAbyss(tree, node.taskId);

      node.stage = 'deleted';
      tree.totalTasks--;
      deleted.push(taskId);
    }

    this.rehomeOrphans(tree);
    return deleted;
  }

  private async createOrUpdateTask(
    tree: TaskTree,
    task: TaskoratorTask,
    action: 'create' | 'update'
  ): Promise<boolean> {
    const parentNode = this.getParentNode(tree, task);
    if (!parentNode) {
      this.moveToAbyss(tree, task);
      return true;
    }

    const existingNode = this.treeTools.findNodeById(parentNode, task.taskId);

    if (existingNode) {
      if (task.stage === 'deleted') {
        return this.removeTaskFromTree(tree, existingNode);
      }

      const wasUpdated = this.updateNodeFields(existingNode, task, tree);
      if (task.overlord !== existingNode.overlord) {
        this.moveTaskNode(tree, existingNode, task.overlord);
      }

      this.updateNodeCounts(existingNode);
      return wasUpdated;
    }

    const newNode = this.createNode(task);
    this.addTaskToParent(parentNode, newNode);
    tree.totalTasks++;
    this.updateNodeCounts(parentNode);
    return true;
  }

  private deduplicateTasks(tasks: TaskoratorTask[]): TaskoratorTask[] {
    return tasks.filter(
      (task, index, self) =>
        index === self.findIndex((t) => t.taskId === task.taskId)
    );
  }

  private createNode(task: TaskoratorTask): TaskTreeNode {
    return {
      taskId: task.taskId,
      name: task.name,
      overlord: task.overlord,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      stage: task.stage,
      connected: false,
    };
  }

  private addTaskToParent(parent: TaskTreeNode, node: TaskTreeNode): void {
    parent.children.push(node);
    this.updateNodeCounts(parent);
  }

  private updateNodeFields(
    node: TaskTreeNode,
    task: TaskoratorTask,
    tree: TaskTree
  ): boolean {
    let updated = false;

    if (node.name !== task.name) {
      node.name = task.name;
      updated = true;
    }

    if (node.stage !== task.stage) {
      node.stage = task.stage;
      updated = true;

      if (node.overlord) {
        const parent = this.getParentNodeById(tree, node.overlord);
        if (parent) {
          this.updateNodeCounts(parent);
        }
      }
    }

    return updated;
  }

  private moveTaskNode(
    tree: TaskTree,
    node: TaskTreeNode,
    newOverlordId: string | null
  ): void {
    this.removeNodeFromParent(tree, node);
    node.overlord = newOverlordId;

    const newParent = this.getParentNodeById(tree, newOverlordId);
    if (newParent) {
      this.addTaskToParent(newParent, node);
    } else {
      this.moveToAbyss(tree, node);
    }
  }

  private orphanChildren(node: TaskTreeNode): void {
    for (const child of node.children) {
      child.overlord = null;
    }
  }

  private removeNodeFromParent(tree: TaskTree, node: TaskTreeNode): void {
    if (!node.overlord) return;

    const parent = this.getParentNodeById(tree, node.overlord);
    if (parent) {
      parent.children = parent.children.filter(
        (child) => child.taskId !== node.taskId
      );

      // Update the parent's counts after removing the child
      this.updateNodeCounts(parent);
    }
  }

  private updateNodeCounts(node: TaskTreeNode): void {
    // Update counts based on the node's actual children
    node.childrenCount = node.children.length;
    node.completedChildrenCount = node.children.filter(
      (c) => c.stage === 'completed' || c.stage === 'deleted'
    ).length;
  }

  private getParentNode(
    tree: TaskTree,
    task: TaskoratorTask
  ): TaskTreeNode | null {
    return this.getParentNodeById(tree, task.overlord);
  }

  private getParentNodeById(
    tree: TaskTree,
    overlordId: string | null
  ): TaskTreeNode | null {
    if (!overlordId) return null;
    return overlordId === ROOT_TASK_ID
      ? tree.primarch
      : this.treeTools.findNodeById(tree.primarch, overlordId);
  }

  private moveToAbyss(
    tree: TaskTree,
    task: TaskoratorTask | TaskTreeNode
  ): void {
    const node = 'children' in task ? task : this.createNode(task);
    if (!tree.abyss.some((n) => n.taskId === node.taskId)) {
      tree.abyss.push(node);
    }
    tree.connected = false;
  }

  private removeFromAbyss(tree: TaskTree, taskId: string): void {
    tree.abyss = tree.abyss.filter((node) => node.taskId !== taskId);
    tree.connected = tree.abyss.length === 0;
  }

  private rehomeOrphans(tree: TaskTree): void {
    const allNodes = this.treeTools.flattenTree(tree.primarch);

    for (const node of allNodes) {
      if (!node.overlord) {
        this.moveToAbyss(tree, node);
      }
    }
  }

  private removeTaskFromTree(tree: TaskTree, node: TaskTreeNode): boolean {
    this.orphanChildren(node);
    this.removeNodeFromParent(tree, node);
    this.removeFromAbyss(tree, node.taskId);
    tree.totalTasks--;
    return true;
  }
}
