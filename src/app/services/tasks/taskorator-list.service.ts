import { Injectable } from '@angular/core';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TaskoratorTask, UiTask } from '../../models/taskModelManager';
import { TreeNodeService } from '../tree/tree-node.service';
import { TaskSettingsTasksService } from './task-settings-tasks.service';
import { TaskUsageService } from './task-usage.service';
import { TaskListSimpleService } from './task-list/task-list-simple.service';
import { TaskListKey, TaskListType } from '../../models/task-list-model';
import { TaskService } from '../sync-api-cache/task.service';
import { TaskUiDecoratorService } from './task-list/task-ui-decorator.service';

@Injectable({
  providedIn: 'root',
})
export class TaskoratorListService {
  constructor(
    private treeNodeService: TreeNodeService,
    private taskUsageService: TaskUsageService,
    private taskListSimpleService: TaskListSimpleService,
    private taskService: TaskService,
    private taskUiDecorator: TaskUiDecoratorService
  ) {}

  /**
   * Generate a superlist of tasks from various sources for the TASKORATOR list type
   */
  async generateSuperlist(tree: TaskTree): Promise<UiTask[]> {
    const superlist: TaskoratorTask[] = [];

    // Get 2 big parents and 2 small parents randomly
    const { bigParents, miniParents } = (this.treeNodeService as any).classifyParents(tree);
    const selectedBigParents: TaskTreeNode[] = this.getRandomItems(bigParents, 2);
    const selectedMiniParents: TaskTreeNode[] = this.getRandomItems(miniParents, 2);

    for (const node of selectedBigParents) {
      const task = await this.taskService.getTaskById(node.taskId);
      if (task) superlist.push(task);
    }
    for (const node of selectedMiniParents) {
      const task = await this.taskService.getTaskById(node.taskId);
      if (task) superlist.push(task);
    }

    // Get 2 focus tasks
    const focusTasks = await this.taskListSimpleService.getTaskList({ type: TaskListType.FOCUS, data: '' });
    if (focusTasks) {
      const selectedFocus = this.getRandomItems(focusTasks.slice(0, 10), 2);
      superlist.push(...selectedFocus);
    }

    // Get 2 most viewed tasks
    const usageData = this.taskUsageService.getAllUsageData();
    const mostViewedIds = Object.entries(usageData)
      .sort(([, a], [, b]) => b.views - a.views)
      .slice(0, 2)
      .map(([taskId]) => taskId);
    for (const taskId of mostViewedIds) {
      const task = await this.taskService.getTaskById(taskId);
      if (task) superlist.push(task);
    }

    // Get latest tasks
    const latestTasks = await this.taskListSimpleService.getTaskList({ type: TaskListType.LATEST_CREATED, data: '' });
    if (latestTasks) {
      superlist.push(...latestTasks.slice(0, 2));
    }

    // Get oldest tasks
    const oldestTasks = await this.taskListSimpleService.getTaskList({ type: TaskListType.OLDEST_CREATED, data: '' });
    if (oldestTasks) {
      superlist.push(...oldestTasks.slice(0, 2));
    }

    // Decorate tasks with UI properties
    const decoratedTasks = this.taskUiDecorator.decorateTasks(superlist);

    return decoratedTasks;
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}