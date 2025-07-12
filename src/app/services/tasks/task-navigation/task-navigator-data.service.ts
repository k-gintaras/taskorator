import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { BehaviorSubject } from 'rxjs';
import { ExtendedTask } from '../../../models/taskModelManager';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../task-action-tracker.service';
import { TaskListRulesService } from '../task-list/task-list-rules.service';
import { TaskListSimpleService } from '../task-list/task-list-simple.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorDataService {
  private currentTasksSubject = new BehaviorSubject<ExtendedTask[]>([]);
  private currentListKeySubject = new BehaviorSubject<TaskListKey | null>(null);

  currentTasks$ = this.currentTasksSubject.asObservable();
  currentListKey$ = this.currentListKeySubject.asObservable();

  constructor(
    private taskActionService: TaskActionTrackerService,
    private taskListSimple: TaskListSimpleService,
    private taskListRules: TaskListRulesService
  ) {
    // Listen for task updates
    this.taskActionService.lastAction$.subscribe((action) => {
      if (action && this.shouldRefreshOnAction(action.action)) {
        this.refreshCurrentTasks();
      }
    });
  }

  private shouldRefreshOnAction(action: TaskActions): boolean {
    return [
      TaskActions.CREATED,
      TaskActions.UPDATED,
      TaskActions.COMPLETED,
      TaskActions.DELETED,
      TaskActions.PRIORITY_INCREASED,
      TaskActions.PRIORITY_DECREASED,
    ].includes(action);
  }

  private async refreshCurrentTasks(): Promise<void> {
    const currentListKey = this.currentListKeySubject.value;
    if (!currentListKey) return;

    // Reload current tasks
    const rawTasks = await this.taskListSimple.getTaskList(currentListKey);
    const processedTasks = this.taskListRules.applyRulesToList(
      currentListKey,
      rawTasks || []
    );

    this.currentTasksSubject.next(processedTasks);
  }

  setTasks(tasks: ExtendedTask[], listKey: TaskListKey) {
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  getCurrentTasks(): ExtendedTask[] {
    return this.currentTasksSubject.value;
  }

  getCurrentListKey(): TaskListKey | null {
    return this.currentListKeySubject.value;
  }
}
