import { Task } from './app/task-model/taskModelManager';

export class TaskTree {
  private tree: Map<string, TaskNode> = new Map(); // Assuming task has 'id' property as string
  buildTree(tasks: Task[]): void {
    // console.log(tasks.length + ' LLLLLLLLLLL');
    this.tree.clear();

    const rootId = '129';

    // Creating task nodes map
    const taskNodes: Map<string, TaskNode> = tasks.reduce((map, task) => {
      map.set(task.taskId, { ...task, children: [] });
      return map;
    }, new Map<string, TaskNode>());

    const rootTask = taskNodes.get(rootId);
    if (!rootTask) return;

    // Linking child nodes with their parents
    taskNodes.forEach((taskNode, taskId) => {
      if (taskNode.overlord !== undefined && taskNode.overlord !== null) {
        const parent = taskNodes.get(taskNode.overlord);
        if (parent) {
          parent.children.push(taskNode);
        }
      }
    });

    this.tree.set(rootId, rootTask);

    // console.log(this.tree);
  }

  getOverlordsNodes(): TaskNode[] {
    const overlords = new Set<string>();
    this.tree.forEach((node, id) => {
      if (node.children && node.children.length > 0) {
        // console.log('children: ' + node.name);
        overlords.add(id);
      }
    });
    return Array.from(overlords.values()).map((id) => this.tree.get(id)!);
  }

  extractTasksFromNode(taskNode: TaskNode): Task[] {
    if (!taskNode) {
      console.log('taskNode is undefined or null');
      return [];
    }
    let tasks: Task[] = taskNode.children.length > 0 ? [taskNode] : [];
    for (const child of taskNode.children) {
      tasks = tasks.concat(this.extractTasksFromNode(child));
    }
    return tasks;
  }

  translateTaskNodesToTasks(taskNodes: TaskNode[]): Task[] {
    let tasks: Task[] = [];
    for (const taskNode of taskNodes) {
      tasks = tasks.concat(this.extractTasksFromNode(taskNode));
    }
    return tasks;
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

  getTaskHierarchy(): TaskNode[] {
    return this.getHierarchy();
  }

  getTaskDepth(taskId: string): number {
    let depth = 0;
    let currentTask = this.tree.get(taskId);
    while (currentTask && currentTask.overlord) {
      depth++;
      currentTask = this.tree.get(currentTask.overlord);
    }
    return depth;
  }

  getTaskBreadth(taskId: string): number {
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

  getTaskPath(taskId: string): string[] {
    const path: string[] = [];
    let currentTask = this.tree.get(taskId);
    while (currentTask) {
      path.push(currentTask.taskId);
      currentTask = currentTask.overlord
        ? this.tree.get(currentTask.overlord)
        : undefined;
    }
    return path.reverse();
  }

  getOverlordTree(): Map<string, TaskNode> {
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

  getOverlords() {
    return this.translateTaskNodesToTasks(this.getOverlordsNodes());
  }

  getSemiOverlords(): TaskNode[] {
    const overlords = new Set<string>();
    this.tree.forEach((node) => {
      if (node.overlord) {
        overlords.add(node.overlord);
      }
    });
    return Array.from(this.tree.values()).filter(
      (node) => !overlords.has(node.taskId)
    );
  }

  toD3Hierarchy(rootTaskId: string): any {
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
