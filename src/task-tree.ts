import { Task } from './app/task-model/taskModelManager';

export class TaskTree {
  private tree: Map<number, TaskNode> = new Map(); // Assuming task has 'id' property as string

  buildTree(tasks: Task[]): void {
    this.tree.clear();
    const taskNodes: Map<number, TaskNode> = tasks.reduce((map, task) => {
      map.set(task.taskId, { ...task, children: [] });
      return map;
    }, new Map<number, TaskNode>());

    taskNodes.forEach((taskNode, taskId) => {
      if (taskNode.overlord) {
        const parent = taskNodes.get(taskNode.overlord);
        if (parent) {
          parent.children.push(taskNode);
        }
      } else {
        this.tree.set(taskId, taskNode);
      }
    });
  }

  getHierarchy(): TaskNode[] {
    return Array.from(this.tree.values());
  }

  getTopLevelTasks(): TaskNode[] {
    return Array.from(this.tree.values()).filter(
      (taskNode) => !taskNode.overlord
    );
  }

  getOrphanTasks(): TaskNode[] {
    return Array.from(this.tree.values()).filter(
      (taskNode) => !taskNode.overlord && taskNode.children.length === 0
    );
  }

  // You already have getTopLevelTasks method

  getTaskHierarchy(): TaskNode[] {
    return this.getHierarchy();
  }

  getTaskDepth(taskId: number): number {
    let depth = 0;
    let currentTask = this.tree.get(taskId);
    while (currentTask && currentTask.overlord) {
      depth++;
      currentTask = this.tree.get(currentTask.overlord);
    }
    return depth;
  }

  getTaskBreadth(taskId: number): number {
    const taskNode = this.tree.get(taskId);
    return taskNode ? taskNode.children.length : 0;
  }

  findCircularReferences(): number[] {
    return [0];
    // You'll have to implement a function to detect cycles in your tree, potentially using DFS
  }

  getLeafTasks(): TaskNode[] {
    const leafTasks: TaskNode[] = [];
    this.tree.forEach((taskNode) => {
      if (taskNode.children.length === 0) {
        leafTasks.push(taskNode);
      }
    });
    return leafTasks;
  }

  getTaskPath(taskId: number): number[] {
    const path: number[] = [];
    let currentTask = this.tree.get(taskId);
    while (currentTask) {
      path.push(currentTask.taskId);
      currentTask = currentTask.overlord
        ? this.tree.get(currentTask.overlord)
        : undefined;
    }
    return path.reverse();
  }

  getOverlordTree(): Map<number, TaskNode> {
    return this.tree;
  }

  filterTasksByDepth(depth: number): TaskNode[] {
    const filteredTasks: TaskNode[] = [];
    this.tree.forEach((taskNode) => {
      if (this.getTaskDepth(taskNode.taskId) === depth) {
        filteredTasks.push(taskNode);
      }
    });
    return filteredTasks;
  }

  getOverlords(): TaskNode[] {
    const overlords = new Set<number>();
    this.tree.forEach((node) => {
      if (node.overlord) {
        overlords.add(node.overlord);
      }
    });
    return Array.from(overlords.values()).map((id) => this.tree.get(id)!);
  }

  getSemiOverlords(): TaskNode[] {
    const overlords = new Set<number>();
    this.tree.forEach((node) => {
      if (node.overlord) {
        overlords.add(node.overlord);
      }
    });
    return Array.from(this.tree.values()).filter(
      (node) => !overlords.has(node.taskId)
    );
  }

  toD3Hierarchy(rootTaskId: number): any {
    const root = this.tree.get(rootTaskId);
    if (!root) {
      return null;
    }

    function traverse(node: TaskNode): any {
      return {
        name: node.taskId, // or any other property representing the task's name
        children: node.children.map(traverse),
      };
    }

    return traverse(root);
  }
}

interface TaskNode extends Task {
  children: TaskNode[];
}
