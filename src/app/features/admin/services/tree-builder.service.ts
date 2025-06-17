import { Injectable } from '@angular/core';
import { TaskTreeNode, TaskTree } from '../../../models/taskTree';
import { TaskoratorTask } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TreeBuilderService {
  constructor() {}

  createTree(tasks: TaskoratorTask[]): TaskTree {
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
    return {
      primarch: root,
      abyss: [],
      connected: true,
      totalTasks: 0,
    };
  }

  private convertTasksToNodes(tasks: TaskoratorTask[]): TaskTreeNode[] {
    return tasks.map((task) => {
      const treeNode: TaskTreeNode = {
        taskId: task.taskId,
        name: task.name,
        overlord: null,
        children: [],
        childrenCount: 0,
        completedChildrenCount: 0,
        connected: false,
        stage: task.stage,
      };

      return treeNode;
    });
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
    const node: TaskTreeNode = {
      taskId: '128',
      name: 'Primarch Node',
      overlord: null,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
      connected: true,
      stage: 'todo',
    };
    return node;
  }
}
