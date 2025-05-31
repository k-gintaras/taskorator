import { Injectable } from '@angular/core';
import { ROOT_TASK_ID, Task } from '../../models/taskModelManager';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TaskTreeNodeToolsService } from './task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeService {
  constructor(private treeTools: TaskTreeNodeToolsService) {}

  async createTasks(tree: TaskTree, tasks: Task[]): Promise<string[]> {
    console.log('creating spam ???');
    const createdTasks: string[] = [];
    const uniqueTasks = tasks.filter(
      (task, index, self) =>
        index === self.findIndex((t) => t.taskId === task.taskId)
    );
    for (const task of uniqueTasks) {
      const wasModified = await this.createOrUpdateTask(tree, task, 'create');
      if (wasModified) {
        createdTasks.push(task.taskId);
      }
    }
    return createdTasks;
  }

  async updateTasks(tree: TaskTree, tasks: Task[]): Promise<string[]> {
    console.log('updating spam ???');

    const updatedTasks: string[] = [];
    for (const task of tasks) {
      const wasModified = await this.createOrUpdateTask(tree, task, 'update');
      if (wasModified) {
        updatedTasks.push(task.taskId);
      }
    }
    return updatedTasks;
  }

  /**
   * Unified method for creating or updating tasks.
   */
  private async createOrUpdateTask(
    tree: TaskTree,
    task: Task,
    action: 'create' | 'update'
  ): Promise<boolean> {
    const isUpdate = action === 'update';
    const parentNode = this.getParentNode(tree, task);

    if (parentNode) {
      const targetNode = this.treeTools.findNodeById(parentNode, task.taskId);

      if (targetNode) {
        if (!isUpdate) {
          console.warn(
            `Task ${task.taskId} already exists. Skipping creation.`
          );
          return false; // No modification occurred
        }
        // Update the existing node
        const wasUpdated = this.updateExistingNode(targetNode, task);

        // Handle potential movement
        if (targetNode.overlord !== task.overlord) {
          this.moveTaskNode(tree, targetNode, task.overlord);
          console.log('moved');

          this.removeFromAbyss(tree, task.taskId); // Remove from abyss if successfully added
          return true; // Task was modified due to movement
        }
        return wasUpdated;
      } else {
        // Add a new node
        const newNode = this.createNewNode(task);
        tree.totalTasks++;
        this.addTaskToParent(parentNode, newNode);
        this.updateNodeCounts(tree, parentNode);
        console.log('new');
        this.removeFromAbyss(tree, task.taskId); // Remove from abyss if successfully added
        return true; // Task was created
      }
    } else {
      // Task has no valid parent, move to abyss
      console.warn(`Parent node not found for task ${task.taskId}`);
      this.moveToAbyss(tree, task);
      return true; // Task was moved to abyss, so it was modified
    }
  }

  /**
   * Determine the parent node for a given task.
   */
  private getParentNode(tree: TaskTree, task: Task): TaskTreeNode | null {
    return task.overlord
      ? task.overlord === ROOT_TASK_ID
        ? tree.primarch
        : this.treeTools.findNodeById(tree.primarch, task.overlord)
      : null;
  }

  /**
   * Create a new TaskTreeNode.
   */
  private createNewNode(task: Task): TaskTreeNode {
    return {
      taskId: task.taskId,
      name: task.name,
      overlord: task.overlord,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      stage: task.stage,
      connected: false, // Connectivity depends on insertion
    };
  }

  /**
   * Update an existing TaskTreeNode.
   */
  private updateExistingNode(node: TaskTreeNode, task: Task): boolean {
    let wasUpdated = false;

    if (node.name !== task.name) {
      node.name = task.name;
      wasUpdated = true;
    }

    if (node.stage !== task.stage) {
      node.stage = task.stage;
      wasUpdated = true;
    }

    if (node.overlord !== task.overlord) {
      wasUpdated = true; // Overlord change will be handled by moveTaskNode
    }

    return wasUpdated;
  }

  /**
   * Add a node to a parent.
   */
  private addTaskToParent(parentNode: TaskTreeNode, node: TaskTreeNode): void {
    if (!node || !node.taskId) {
      console.error(
        'Attempting to add an invalid node to parent:',
        node,
        parentNode
      );
      return;
    }

    if (!parentNode.children.some((child) => child.taskId === node.taskId)) {
      parentNode.children.push(node);
      parentNode.childrenCount++;
      if (node.stage === 'completed') {
        parentNode.completedChildrenCount++;
      }
      node.connected = true;
      console.log('Added node to parent:', node, parentNode);
    }
  }

  /**
   * Move a task node to a new parent.
   */
  private moveTaskNode(
    tree: TaskTree,
    node: TaskTreeNode,
    newOverlordId: string | null
  ): void {
    const oldParentNode = node.overlord
      ? this.treeTools.findNodeById(tree.primarch, node.overlord)
      : tree.primarch;
    const newParentNode = newOverlordId
      ? this.treeTools.findNodeById(tree.primarch, newOverlordId)
      : tree.primarch;

    if (oldParentNode && newParentNode) {
      // Remove from old parent
      oldParentNode.children = oldParentNode.children.filter(
        (child) => child.taskId !== node.taskId
      );
      oldParentNode.childrenCount--;
      if (node.stage === 'completed') {
        oldParentNode.completedChildrenCount--;
      }

      // Add to new parent
      this.addTaskToParent(newParentNode, node);

      // Update node's parent reference
      node.overlord = newOverlordId;

      // Update counts for both parents
      this.updateNodeCounts(tree, oldParentNode);
      this.updateNodeCounts(tree, newParentNode);
    } else {
      console.warn(`Failed to move task ${node.taskId}`);
      this.moveToAbyss(tree, node);
    }
  }

  /**
   * Move a task to the abyss.
   */
  private moveToAbyss(tree: TaskTree, task: Task | TaskTreeNode): void {
    const newNode =
      'children' in task ? task : this.createNewNode(task as Task);

    // Check if the task already exists in the abyss
    const isTaskInAbyss = tree.abyss.some(
      (node) => node.taskId === newNode.taskId
    );

    if (!isTaskInAbyss) {
      tree.abyss.push(newNode);
      console.log(`Task ${newNode.taskId} added to abyss.`);
    } else {
      console.warn(`Task ${newNode.taskId} is already in the abyss. Skipping.`);
    }

    tree.connected = false; // Mark tree as disconnected
  }

  /**
   * Remove a task from the abyss.
   */
  private removeFromAbyss(tree: TaskTree, taskId: string): void {
    if (!tree || !tree.abyss) {
      console.warn('Tree or abyss is not initialized.');
      return;
    }

    const taskIndex = tree.abyss.findIndex((node) => node.taskId === taskId);
    if (taskIndex === -1) {
      console.log(`Task ${taskId} was not found in the abyss.`);
      return;
    }

    tree.abyss.splice(taskIndex, 1);
    console.log(`Task ${taskId} removed from abyss.`);
    tree.connected = tree.abyss.length === 0; // Update connection status
  }

  /**
   * Update counts for a node and its ancestors.
   */
  private updateNodeCounts(tree: TaskTree, node: TaskTreeNode): void {
    const visitedNodes = new Set<string>();
    let currentNode: TaskTreeNode | null = node;
    while (currentNode && !visitedNodes.has(currentNode.taskId)) {
      visitedNodes.add(currentNode.taskId);
      currentNode.completedChildrenCount = currentNode.children.filter(
        (child) => child.stage === 'completed'
      ).length;
      currentNode.childrenCount = currentNode.children.length;
      currentNode = currentNode.overlord
        ? this.treeTools.findNodeById(tree.primarch, currentNode.overlord)
        : null;
    }
  }
}
