import { Injectable } from '@angular/core';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskListSimpleService } from './task-list-simple.service';
import { TaskUiDecoratorService } from './task-ui-decorator.service';
import { TaskUsageService } from '../task-usage.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCoordinatorService {
  constructor(
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService,
    private taskDecorator: TaskUiDecoratorService,
    private taskUsageService: TaskUsageService
  ) {}

  async getTasks(taskListKey: TaskListKey): Promise<UiTask[]> {
    if (taskListKey.type === TaskListType.SELECTED) {
      const ids = this.taskDecorator.getSelectedTaskIds();
      return this.getTasksByIds(ids);
    }

    if (taskListKey.type === TaskListType.MOST_VIEWED) {
      return this.getTasksByMostViewed();
    }

    const rawTasks = await this.taskListSimple.getTaskList(taskListKey);
    if (!rawTasks) return [];

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      taskListKey,
      rawTasks
    );

    return this.taskDecorator.decorateTasks(filteredSortedTasks);
  }

  async getTasksByIds(ids: string[]): Promise<UiTask[]> {
    if (!ids.length) return [];
    const rawTasks = await this.taskListSimple.getTasksByIds(ids);
    return this.taskDecorator.decorateTasks(rawTasks);
  }

  async getTasksByMostViewed(): Promise<UiTask[]> {
    // TODO: add simple thing ez pz
    // const rawTasks: string[] = await this.taskUsageService.getMostViewedTasks();
    // if (!rawTasks) return [];

    // const filteredSortedTasks = this.taskListRules.applyRulesToList(
    //   { type: TaskListType.MOST_VIEWED, id: 'mostViewed' },
    //   rawTasks
    // );

    // return this.taskDecorator.decorateTasks(filteredSortedTasks);
    return [];
  }
}
