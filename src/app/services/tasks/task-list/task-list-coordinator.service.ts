import { Injectable } from '@angular/core';
import {
  TaskListRules,
  defaultTaskLists,
  TaskListKey,
} from '../../../models/task-list-model';
import { ExtendedTask } from '../../../models/taskModelManager';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskListSimpleService } from './task-list-simple.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCoordinatorService {
  constructor(
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService // TaskStatusService used separately by components
  ) {}

  async getProcessedTaskList(
    taskListKey: TaskListKey
  ): Promise<ExtendedTask[]> {
    const rawTasks = await this.taskListSimple.getTaskList(taskListKey);
    if (!rawTasks) return [];

    return this.taskListRules.applyRulesToList(taskListKey, rawTasks);
  }
}
