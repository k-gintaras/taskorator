import { Injectable } from '@angular/core';
import { TaskTreeNode, TaskTree } from '../../../models/taskTree';
import { Task } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TreeBuilderService {
  constructor() {}

  createTree(tasks: Task[]): TaskTree {
    const taskNodes = this.convertTasksToNodes(tasks);
    const root = this.findRootNode(taskNodes) || this.getDefaultRootNode();
    this.buildTree(root, taskNodes);

    const unconnectedTasks = taskNodes.filter((task) => !task.overlord);
    unconnectedTasks.forEach((task) => {
      task.overlord = '128'; // Set the overlord to '128'
      root.children.push(task); // Connect the task to the root node
    });

    console.log('unconnectedTasks');
    console.log(unconnectedTasks);
    return { root };
  }

  private convertTasksToNodes(tasks: Task[]): TaskTreeNode[] {
    return tasks.map((task) => ({
      taskId: task.taskId,
      overlord: task.overlord,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      name: task.name,
      isCompleted: task.stage === 'completed',
    }));
  }

  private findRootNode(tasks: TaskTreeNode[]): TaskTreeNode | undefined {
    return tasks.find((task) => task.overlord === null);
  }

  private buildTree(parentNode: TaskTreeNode, tasks: TaskTreeNode[]): void {
    const children = tasks.filter(
      (task) => task.overlord === parentNode.taskId
    );
    children.forEach((child) => {
      parentNode.children.push(child);
      this.buildTree(child, tasks);
    });
  }

  private getDefaultRootNode(): TaskTreeNode {
    return {
      taskId: '128',
      overlord: null,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      name: 'Root Node',
      isCompleted: false,
    };
  }
}
