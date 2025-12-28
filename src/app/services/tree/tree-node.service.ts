import { Injectable } from '@angular/core';
import { ROOT_TASK_ID, TaskoratorTask, TaskStage } from '../../models/taskModelManager';
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
    node.completedChildrenCount = node.children.filter((c) =>
      this.isCompletedStage(c.stage)
    ).length;
  }

  /**
   * Recalculate children/completed counts for the provided parent nodes.
   * Returns how many parents changed so callers can decide whether to persist.
   */
  recountParentCounts(tree: TaskTree, parentIds: Set<string>): number {
    if (!tree?.primarch || !parentIds.size) return 0;

    let updatedCount = 0;

    for (const parentId of parentIds) {
      if (!parentId) continue;

      const parentNode =
        parentId === ROOT_TASK_ID
          ? tree.primarch
          : this.treeTools.findNodeById(tree.primarch, parentId);

      if (!parentNode) continue;

      const beforeChildren = parentNode.childrenCount;
      const beforeCompleted = parentNode.completedChildrenCount;

      this.updateNodeCounts(parentNode);

      if (
        parentNode.childrenCount !== beforeChildren ||
        parentNode.completedChildrenCount !== beforeCompleted
      ) {
        updatedCount++;
      }
    }

    return updatedCount;
  }

  private isCompletedStage(stage: TaskStage): boolean {
    return stage !== 'todo';
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

  private classifyParents(tree: TaskTree): {
    bigParents: TaskTreeNode[];
    miniParents: TaskTreeNode[];
  } {
    if (!tree?.primarch) return { bigParents: [], miniParents: [] };

    const ROOT_ID = ROOT_TASK_ID; // from your constants
    const bigParents: TaskTreeNode[] = [];
    const miniParents: TaskTreeNode[] = [];

    const stack: { node: TaskTreeNode; depth: number }[] = [
      { node: tree.primarch, depth: 0 },
    ];

    while (stack.length) {
      const { node, depth } = stack.pop()!;

      const hasChildren = node.children.length > 0;
      const hasGrandchildren = node.children.some(
        (c) => c.children.length > 0
      );

      if (node.taskId !== ROOT_ID && node.stage === 'todo' && hasChildren) {
        if (hasGrandchildren && depth >= 1) {
          bigParents.push(node);
        } else if (!hasGrandchildren && node.children.length >= 2) {
          miniParents.push(node);
        }
      }

      node.children.forEach((child) =>
        stack.push({ node: child, depth: depth + 1 })
      );
    }

    return { bigParents, miniParents };
  }

  /**
   * Returns parent nodes that have children which themselves have children.
   * Useful for game logic that needs "big" containers.
   */
  getBigParents(tree: TaskTree): TaskTreeNode[] {
    return this.classifyParents(tree).bigParents;
  }

  /**
   * Return a random parent node that has at least `minChildren` children.
   * If none found, returns `null`.
   */
  getRandomParentWithMinChildren(
    tree: TaskTree,
    minChildren = 3
  ): TaskTreeNode | null {
    if (!tree?.primarch) return null;
    const all = this.treeTools.flattenTree(tree.primarch);
    const candidates = all.filter((n) => (n.children || []).length >= minChildren);
    if (!candidates.length) return null;
    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx];
  }

  /**
   * Given a `taskId`, return the node and its parent (if any).
   * Searches both the main tree and the `abyss` for the node.
   */
  getNodeAndParent(
    tree: TaskTree,
    taskId: string
  ): { node: TaskTreeNode | null; parent: TaskTreeNode | null } {
    if (!tree?.primarch) return { node: null, parent: null };

    const node = this.treeTools.findNodeById(tree.primarch, taskId) ||
      (tree.abyss || []).find((n) => n.taskId === taskId) ||
      null;

    if (!node) return { node: null, parent: null };

    const parent = node.overlord ? this.getParentNodeById(tree, node.overlord) : null;
    return { node, parent };
  }

  /**
   * Return all nodes that share duplicate names (case-insensitive).
   * Useful for detecting collisions and creating game challenges.
   */
  getNodesWithDuplicateNames(tree: TaskTree): TaskTreeNode[] {
    if (!tree?.primarch) return [];
    const all = this.treeTools.flattenTree(tree.primarch).concat(tree.abyss || []);
    const byName = new Map<string, TaskTreeNode[]>();

    for (const n of all) {
      const key = (n.name || '').trim().toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push(n);
    }

    const duplicates: TaskTreeNode[] = [];
    for (const [k, arr] of byName) {
      if (k && arr.length > 1) duplicates.push(...arr);
    }

    return duplicates;
  }

  /**
   * Return a shallow copy of tasks currently in the abyss (orphaned tasks).
   */
  getAbyssTasks(tree: TaskTree): TaskTreeNode[] {
    return tree?.abyss ? [...tree.abyss] : [];
  }
}
