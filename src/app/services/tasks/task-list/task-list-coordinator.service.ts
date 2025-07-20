import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskListSimpleService } from './task-list-simple.service';
import { TaskUiDecoratorService } from './task-ui-decorator.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCoordinatorService {
  constructor(
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService,
    private taskDecorator: TaskUiDecoratorService
  ) {}

  async getTasks(taskListKey: TaskListKey): Promise<UiTask[]> {
    const rawTasks = await this.taskListSimple.getTaskList(taskListKey);
    if (!rawTasks) return [];

    const filteredSortedTasks = this.taskListRules.applyRulesToList(
      taskListKey,
      rawTasks
    );

    const decoratedTasks =
      this.taskDecorator.decorateTasks(filteredSortedTasks);

    return decoratedTasks;
  }
}
