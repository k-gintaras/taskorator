import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { BehaviorSubject } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../task-action-tracker.service';
import { TaskListCoordinatorService } from '../task-list/task-list-coordinator.service';
import { TaskUiDecoratorService } from '../task-list/task-ui-decorator.service';

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
    private taskListSimple: TaskListCoordinatorService,
    private taskDecorator: TaskUiDecoratorService
  ) {
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

    const rawTasks = await this.taskListSimple.getTasks(currentListKey);
    const decoratedTasks = rawTasks
      ? this.taskDecorator.decorateTasks(rawTasks)
      : [];

    this.currentTasksSubject.next(decoratedTasks);
  }

  setTasks(tasks: UiTask[], listKey: TaskListKey) {
    const decoratedTasks = this.taskDecorator.decorateTasks(tasks);
    this.currentTasksSubject.next(decoratedTasks);
    this.currentListKeySubject.next(listKey);
  }

  getCurrentTasks(): UiTask[] {
    return this.currentTasksSubject.value;
  }

  getCurrentListKey(): TaskListKey | null {
    return this.currentListKeySubject.value;
  }
}
