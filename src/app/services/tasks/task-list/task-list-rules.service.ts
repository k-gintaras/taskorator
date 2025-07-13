import { Injectable } from '@angular/core';
import {
  TaskListRules,
  defaultTaskLists,
  TaskListKey,
} from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskListRulesService {
  private lists = new Map<string, TaskListRules>();

  constructor() {
    this.initializeDefaultLists();
  }

  private initializeDefaultLists(): void {
    defaultTaskLists.forEach((list) => this.lists.set(list.type, { ...list }));
  }

  /**
   * Get a list by its type and associated data.
   */
  getList(key: TaskListKey): TaskListRules | null {
    // const id = getIdFromKey(key);

    // since we generalize lists like overlord and session...
    return this.lists.get(key.type) || null;
  }

  /**
   * Apply rules to tasks in a specific list.
   */
  applyRulesToList(key: TaskListKey, tasks: UiTask[]): UiTask[] {
    const list = this.getList(key);
    if (!list || !list.rules) return tasks;

    const { filter, sorter } = list.rules;
    let filteredTasks = filter ? tasks.filter(filter) : tasks;
    if (sorter) {
      filteredTasks = filteredTasks.sort(sorter);
    }
    return filteredTasks;
  }
}
