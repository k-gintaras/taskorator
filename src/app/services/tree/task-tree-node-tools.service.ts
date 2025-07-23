import { Injectable } from '@angular/core';
import { TaskNodeInfo, TaskTree, TaskTreeNode } from '../../models/taskTree';
import { ROOT_TASK_ID } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeNodeToolsService {
  constructor() {}

  /**
   * Validate the structure of a TaskTreeNode.
   */
  validateNode(node: TaskTreeNode): boolean {
    if (!node || !node.taskId || !node.name) {
      console.warn(`Invalid node structure: ${JSON.stringify(node)}`);
      return false;
    }
    if (node.taskId === ROOT_TASK_ID && node.overlord !== null) {
      console.warn(
        `Primarch node cannot have an overlord: ${JSON.stringify(node)}`
      );
      return false;
    }
    return true;
  }

  findPathStringToTask(taskId: string, tree: TaskTree): string {
    if (!tree || !tree.primarch) return '';

    const pathNodes = this.findPathToTask(taskId, tree.primarch);
    if (!pathNodes) return '';

    return pathNodes.map((node) => node.name).join(' >>> ');
  }

  /**
   * Find a task node by ID.
   */
  findNodeById(node: TaskTreeNode, taskId: string): TaskTreeNode | null {
    if (!node) return null;
    if (node.taskId === taskId) return node;

    for (const child of node.children) {
      const found = this.findNodeById(child, taskId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Determine if a task node has many descendants.
   */
  hasManyDescendants(node: TaskTreeNode, threshold: number): boolean {
    let count = 0;

    const countDescendants = (currentNode: TaskTreeNode) => {
      count += currentNode.children.length;
      currentNode.children.forEach(countDescendants);
    };

    countDescendants(node);
    return count >= threshold;
  }

  /**
   * Determine if a task is deeply nested within the tree.
   */
  isDeeplyNested(node: TaskTreeNode, depthThreshold: number): boolean {
    const getDepth = (currentNode: TaskTreeNode): number => {
      if (!currentNode.children.length) return 0;
      return 1 + Math.max(...currentNode.children.map(getDepth));
    };

    return getDepth(node) > depthThreshold;
  }

  async getTaskIdsToSplit(taskTree: TaskTree): Promise<TaskTreeNode[] | null> {
    const tasksToSplit: TaskTreeNode[] = [];
    const traverse = (node: TaskTreeNode) => {
      if (this.hasManyDescendants(node, 20) || this.isDeeplyNested(node, 3)) {
        tasksToSplit.push(node);
      }
      node.children.forEach(traverse);
    };

    traverse(taskTree.primarch);
    return tasksToSplit.length > 0 ? tasksToSplit : null;
  }

  async getTaskIdsToCrush(taskTree: TaskTree): Promise<TaskTreeNode[] | null> {
    const tasksToCrush: TaskTreeNode[] = [];
    const traverse = (node: TaskTreeNode) => {
      if (node.children.length > 10) {
        tasksToCrush.push(node);
      }
      node.children.forEach(traverse);
    };

    traverse(taskTree.primarch);
    return tasksToCrush.length > 0 ? tasksToCrush : null;
  }

  /**
   * Find the path to a task node.
   */
  findPathToTask(
    taskId: string,
    node: TaskTreeNode,
    path: TaskTreeNode[] = []
  ): TaskTreeNode[] | null {
    const newPath = [...path, node];
    if (node.taskId === taskId) return newPath;

    for (const child of node.children) {
      const result = this.findPathToTask(taskId, child, newPath);
      if (result) return result;
    }
    return null;
  }

  countDescendants(node: TaskTreeNode): number {
    return node.children.reduce(
      (acc, child) => acc + 1 + this.countDescendants(child),
      0
    );
  }

  validateTree(tree: TaskTree): boolean {
    const nodes = this.flattenTree(tree.primarch);
    const invalidNodes = nodes.filter((n) => !this.validateNode(n));
    if (invalidNodes.length > 0) {
      console.warn(`Invalid nodes found: ${invalidNodes.map((n) => n.taskId)}`);
      return false;
    }
    return true;
  }

  /**
   * Flatten the task tree into a list of nodes.
   */
  getFlattened(tree: TaskTree): TaskTreeNode[] {
    console.log('Getting flattened tree 2 ');
    console.log(tree);
    return this.flattenTree(tree.primarch);
  }

  flattenTree(
    node: TaskTreeNode,
    filter?: (node: TaskTreeNode) => boolean,
    array: TaskTreeNode[] = []
  ): TaskTreeNode[] {
    if (!node) return array;

    if (!filter || filter(node)) array.push(node);

    node.children.forEach((child) => {
      this.flattenTree(child, filter, array);
    });

    return array;
  }

  /**
   * Check if the tree is fully connected.
   */
  checkTreeConnectivity(tree: TaskTree): boolean {
    const unconnectedTasks = this.getFlattened(tree).filter(
      (node) => !node.connected
    );
    if (unconnectedTasks.length === 0) {
      console.log('Tree is fully connected');
      tree.connected = true;
      return true;
    }

    console.warn(
      `Tree has unconnected tasks: ${unconnectedTasks.map(
        (task) => task.taskId
      )}`
    );
    tree.connected = false;
    return false;
  }

  /**
   * Get information about a specific task in the tree.
   */
  getTaskInfo(tree: TaskTree, taskId: string): TaskNodeInfo | null {
    const treeNode = this.findNodeById(tree.primarch, taskId);

    const abyssNode = tree?.abyss?.find((t) => t.taskId === taskId);
    const node = treeNode || abyssNode;
    if (!node) return null;

    return {
      taskId: node.taskId,
      stage: node.stage,
      overlord: node.overlord,
      childrenCount: node.childrenCount,
      completedChildrenCount: node.completedChildrenCount,
      connected: node.connected,
    };
  }
}
