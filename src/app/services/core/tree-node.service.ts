import { Injectable } from '@angular/core';
import { Task } from '../../models/taskModelManager';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeService {
  async createTasks(tree: TaskTree, tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.createTask(tree, task);
    }
  }

  async createTask(tree: TaskTree, task: Task): Promise<void> {
    const parentNode = task.overlord
      ? this.findNode(tree.root, task.overlord)
      : tree.root;
    if (parentNode) {
      const existingNode = this.findNode(parentNode, task.taskId);
      if (existingNode) {
        // Update the existing node's properties
        existingNode.name = task.name;
        existingNode.overlord = task.overlord;
        existingNode.isCompleted = task.stage === 'completed';
        // Update parent node counts if needed
        if (existingNode.isCompleted && !parentNode.isCompleted) {
          parentNode.completedChildrenCount++;
        } else if (!existingNode.isCompleted && parentNode.isCompleted) {
          parentNode.completedChildrenCount--;
        }
      } else {
        // Create a new node
        const newNode: TaskTreeNode = {
          taskId: task.taskId,
          name: task.name,
          overlord: task.overlord,
          children: [],
          childrenCount: 0,
          completedChildrenCount: 0,
          isCompleted: task.stage === 'completed',
        };
        parentNode.children.push(newNode);
        parentNode.childrenCount++;
        if (newNode.isCompleted) {
          parentNode.completedChildrenCount++;
        }
      }
    }
  }

  async healTree(tree: TaskTree, tasks: Task[]): Promise<boolean> {
    if (tree) {
      const missingTasks = tasks.filter(
        (task) => !this.findNode(tree.root, task.taskId)
      );
      if (missingTasks.length > 0) {
        await this.createTasks(tree, missingTasks);
        return true;
      }
    }
    return false;
  }

  async updateTask(tree: TaskTree, task: Task): Promise<void> {
    const currentNode = this.findNode(tree.root, task.taskId);
    if (currentNode && currentNode.overlord !== task.overlord) {
      this.moveTaskNode(tree, currentNode, task.overlord);
    }
    if (currentNode) {
      currentNode.name = task.name;
      currentNode.isCompleted = task.stage === 'completed';
      this.updateNodeCounts(tree, currentNode);
    }
  }

  async updateTasks(tree: TaskTree, tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.updateTask(tree, task);
    }
  }

  private findNode(node: TaskTreeNode, taskId: string): TaskTreeNode | null {
    if (node.taskId === taskId) return node;
    for (const child of node.children) {
      const found = this.findNode(child, taskId);
      if (found) return found;
    }
    return null;
  }

  private moveTaskNode(
    tree: TaskTree,
    node: TaskTreeNode,
    newOverlordId: string | null
  ): void {
    const oldParentNode = node.overlord
      ? this.findNode(tree.root, node.overlord)
      : tree.root;
    const newParentNode = newOverlordId
      ? this.findNode(tree.root, newOverlordId)
      : tree.root;
    if (oldParentNode && newParentNode) {
      oldParentNode.children = oldParentNode.children.filter(
        (child) => child.taskId !== node.taskId
      );
      oldParentNode.childrenCount--;
      if (node.isCompleted) {
        oldParentNode.completedChildrenCount--;
      }
      newParentNode.children.push(node);
      newParentNode.childrenCount++;
      if (node.isCompleted) {
        newParentNode.completedChildrenCount++;
      }
      node.overlord = newOverlordId;
    }
  }

  private updateNodeCounts(tree: TaskTree, node: TaskTreeNode): void {
    let currentNode: TaskTreeNode | null = node;
    while (currentNode) {
      currentNode.completedChildrenCount = currentNode.children.filter(
        (child) => child.isCompleted
      ).length;
      currentNode = currentNode.overlord
        ? this.findNode(tree.root, currentNode.overlord)
        : null;
    }
  }
}
