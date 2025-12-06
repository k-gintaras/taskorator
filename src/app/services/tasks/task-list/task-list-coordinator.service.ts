import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

    // FIRST: Decorate tasks with UI properties (views, priority, colors, etc.)
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);

    // THEN: Apply rules (filtering and sorting) to decorated tasks
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      taskListKey,
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByIds(ids: string[]): Promise<UiTask[]> {
    if (!ids.length) return [];
    const rawTasks = await this.taskListSimple.getTasksByIds(ids);
    
    // FIRST: Decorate tasks with UI properties
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);
    
    // THEN: Apply rules for selected tasks
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.SELECTED, data: 'selected' },
      decoratedTasks
    );
    
    return filteredSortedTasks;
  }

  async getTasksByMostViewed(): Promise<UiTask[]> {
    const mostViewedTaskIds = this.taskUsageService.getMostViewedTasks(20); // Get top 20 most viewed
    if (!mostViewedTaskIds.length) return [];

    const rawTasks = await this.taskListSimple.getTasksByIds(mostViewedTaskIds);
    
    // FIRST: Decorate tasks with UI properties (including views count)
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);

    // THEN: Apply rules for most viewed list (sorting by views + priority)
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.MOST_VIEWED, data: 'mostViewed' },
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByRecentlyViewed(): Promise<UiTask[]> {
    const recentTaskIds = this.taskUsageService.getRecentlyViewedTasks(20); // Get top 20 recently viewed
    if (!recentTaskIds.length) return [];

    const rawTasks = await this.taskListSimple.getTasksByIds(recentTaskIds);
    
    // FIRST: Decorate tasks with UI properties (including views count)
    const decoratedTasks = this.taskDecorator.decorateTasks(rawTasks);

    // THEN: Apply rules for recently viewed list (sorting by views + priority)
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.RECENTLY_VIEWED, data: 'recentlyViewed' },
      decoratedTasks
    );

    return filteredSortedTasks;
  }

  async getTasksByTaskorator(): Promise<UiTask[]> {
    const tree = await firstValueFrom(this.treeService.getTree());
    if (!tree) return [];

    const rawTasks = await this.taskoratorListService.generateSuperlist(tree);

    // Apply rules for taskorator list (filtering and sorting)
    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      { type: TaskListType.TASKORATOR, data: 'taskorator' },
      rawTasks
    );

    return filteredSortedTasks;
  }
}
