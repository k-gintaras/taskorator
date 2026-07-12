import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskListSimpleService } from './task-list-simple.service';
import { TaskUiDecoratorService } from './task-ui-decorator.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskoratorListService } from '../taskorator-list.service';
import { TreeService } from '../../sync-api-cache/tree.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCoordinatorService {
  constructor(
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService,
    private taskDecorator: TaskUiDecoratorService,
    private taskUsageService: TaskUsageService,
    private taskoratorListService: TaskoratorListService,
    private treeService: TreeService
  ) {}

  async getTasks(taskListKey: TaskListKey): Promise<UiTask[]> {
    if (taskListKey.type === TaskListType.SELECTED) {
      const ids = this.taskDecorator.getSelectedTaskIds();
      return this.getTasksByIds(ids);
    }

    if (taskListKey.type === TaskListType.MOST_VIEWED) {
      return this.getTasksByMostViewed();
    }

    if (taskListKey.type === TaskListType.RECENTLY_VIEWED) {
      return this.getTasksByRecentlyViewed();
    }

    if (taskListKey.type === TaskListType.TASKORATOR) {
      return this.getTasksByTaskorator();
    }

    const rawTasks = await this.taskListSimple.getTaskList(taskListKey);
    if (!rawTasks) return [];

    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      taskListKey,
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByIds(ids: string[]): Promise<UiTask[]> {
    if (!ids.length) return [];
    const rawTasks = await this.taskListSimple.getTasksByIds(ids);

    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.SELECTED, data: 'selected' },
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByMostViewed(): Promise<UiTask[]> {
    const mostViewedTaskIds = this.taskUsageService.getMostViewedTasks(20);
    if (!mostViewedTaskIds.length) return [];

    const rawTasks = await this.taskListSimple.getTasksByIds(mostViewedTaskIds);
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.MOST_VIEWED, data: 'mostViewed' },
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByRecentlyViewed(): Promise<UiTask[]> {
    const recentTaskIds = this.taskUsageService.getRecentlyViewedTasks(20);
    if (!recentTaskIds.length) return [];

    const rawTasks = await this.taskListSimple.getTasksByIds(recentTaskIds);
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.RECENTLY_VIEWED, data: 'recentlyViewed' },
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByTaskorator(): Promise<UiTask[]> {
    // TREE NOTE:
    // Taskorator uses the helper tree only as a discovery index.
    // The tree may lag behind canonical task documents after login/reload until
    // a parent visit or explicit repair path reconciles it.
    let helperTree = this.treeService.getLatestTree();
    if (!helperTree) {
      await this.treeService.fetchTree();
      helperTree = this.treeService.getLatestTree();
    }
    if (!helperTree) {
      // TODO: if this becomes a common UX gap, fall back to a purely task-based
      // Taskorator seed strategy instead of depending on the helper tree.
      return [];
    }

    const rawTasks = await this.taskoratorListService.generateSuperlist(helperTree);

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.TASKORATOR, data: 'taskorator' },
      rawTasks
    );

    return filteredSortedTasks;
  }
}
