import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { BehaviorSubject } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../task-action-tracker.service';
import { TaskListCoordinatorService } from '../task-list/task-list-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorDataService {
  private currentTasksSubject = new BehaviorSubject<UiTask[]>([]);
  private currentListKeySubject = new BehaviorSubject<TaskListKey | null>(null);

  currentTasks$ = this.currentTasksSubject.asObservable();
  currentListKey$ = this.currentListKeySubject.asObservable();

  constructor(
    private taskActionService: TaskActionTrackerService,
    private taskListSimple: TaskListCoordinatorService
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
    const rawTasks = await this.taskListSimple.getTasks(currentListKey);

    this.currentTasksSubject.next(rawTasks);
  }

  setTasks(tasks: UiTask[], listKey: TaskListKey) {
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  getCurrentTasks(): UiTask[] {
    return this.currentTasksSubject.value;
  }

  getCurrentListKey(): TaskListKey | null {
    return this.currentListKeySubject.value;
  }
}
