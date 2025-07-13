import { Injectable } from '@angular/core';
import {
  TaskListRules,
  defaultTaskLists,
  TaskListKey,
} from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskListSimpleService } from './task-list-simple.service';
import { TaskEnhancementService } from './task-enhancement.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCoordinatorService {
  constructor(
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService,
    private taskEnhancer: TaskEnhancementService
  ) {}

  async getTasks(taskListKey: TaskListKey): Promise<UiTask[]> {
    const rawTasks = await this.taskListSimple.getTaskList(taskListKey);
    if (!rawTasks) return [];

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      taskListKey,
      rawTasks
    );
    const enhancedTasks =
      this.taskEnhancer.enhanceTasks(filteredSortedTasks) || [];

    return enhancedTasks;
  }
}
