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

  findPathToTask(
    taskId: string,
    node: TaskTreeNode,
    path: TaskTreeNode[] = []
  ): TaskTreeNode[] | null {
    path.push(node);

    if (node.taskId === taskId) {
      return path;
    }

    for (const child of node.children) {
      const result = this.findPathToTask(taskId, child, path.slice());
      if (result) return result;
    }

    return null; // Return null if the task isn't found
  }

  async createTask(tree: TaskTree, task: Task): Promise<void> {
    const parentNode = task.overlord
      ? this.findNodeById(tree.root, task.overlord)
      : tree.root;
    if (parentNode) {
      const existingNode = this.findNodeById(parentNode, task.taskId);
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
        (task) => !this.findNodeById(tree.root, task.taskId)
      );
      if (missingTasks.length > 0) {
        await this.createTasks(tree, missingTasks);
        return true;
      }
    }
    return false;
  }

  async updateTask(tree: TaskTree, task: Task): Promise<void> {
    const currentNode = this.findNodeById(tree.root, task.taskId);
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

  // Checks if a node has incomplete children
  hasIncompleteChildren(tree: TaskTree, taskId: string): boolean {
    const node = this.findNodeById(tree.root, taskId);
    if (!node) return false;
    return node.children.some((child) => !child.isCompleted);
  }

  // Checks if a node has any children
  hasChildren(tree: TaskTree, taskId: string): boolean {
    const node = this.findNodeById(tree.root, taskId);
    return node ? node.children.length > 0 : false;
  }

  findNodeById(node: TaskTreeNode, taskId: string): TaskTreeNode | null {
    if (node.taskId === taskId) return node;
    for (const child of node.children) {
      const found = this.findNodeById(child, taskId);
      if (found) return found;
    }
    return null;
  }

  findNodeByName(node: TaskTreeNode, taskName: string): TaskTreeNode | null {
    if (node.name === taskName) return node;
    for (const child of node.children) {
      const found = this.findNodeById(child, taskName);
      if (found) return found;
    }
    return null;
  }

  getFlattened(taskTree: TaskTree): TaskTreeNode[] {
    return this.flattenTaskTree(taskTree.root); // Assuming the tree has a 'root' node
  }

  private flattenTaskTree(
    node: TaskTreeNode,
    array: TaskTreeNode[] = []
  ): TaskTreeNode[] {
    // Make sure to include all properties of TaskTreeNode in the object pushed into the array
    array.push({
      name: node.name,
      taskId: node.taskId,
      children: node.children,
      isCompleted: node.isCompleted, // Assuming boolean type
      overlord: node.overlord, // Assuming a string or object type
      childrenCount: node.childrenCount, // Assuming integer type
      completedChildrenCount: node.completedChildrenCount, // Assuming integer type
    });

    // Recursively flatten each child node
    node.children.forEach((child) => {
      this.flattenTaskTree(child, array);
    });

    return array;
  }

  /**
   * Determines if a task has many descendants.
   * @param taskTreeNode - The task to check.
   * @param threshold - The number of descendants that qualifies a task to be split.
   * @returns True if the task has more descendants than the threshold.
   */
  hasManyDescendants(taskTreeNode: TaskTreeNode, threshold: number): boolean {
    let count = 0;

    const countDescendants = (task: TaskTreeNode) => {
      count += task.children.length;
      task.children.forEach(countDescendants);
    };

    countDescendants(taskTreeNode);
    return count >= threshold;
  }

  /**
   * Determines if a task is deeply nested within the tree.
   * @param taskTreeNode - The task to check.
   * @param depthThreshold - The depth beyond which a task is considered deeply nested.
   * @returns True if the task's depth exceeds the threshold.
   */
  isDeeplyNested(taskTreeNode: TaskTreeNode, depthThreshold: number): boolean {
    const getDepth = (task: TaskTreeNode): number => {
      if (!task.children.length) return 0;
      return 1 + Math.max(...task.children.map(getDepth));
    };

    return getDepth(taskTreeNode) > depthThreshold;
  }

  private moveTaskNode(
    tree: TaskTree,
    node: TaskTreeNode,
    newOverlordId: string | null
  ): void {
    const oldParentNode = node.overlord
      ? this.findNodeById(tree.root, node.overlord)
      : tree.root;
    const newParentNode = newOverlordId
      ? this.findNodeById(tree.root, newOverlordId)
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
        ? this.findNodeById(tree.root, currentNode.overlord)
        : null;
    }
  }
}
