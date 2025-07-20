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
    private taskListCoordinator: TaskListCoordinatorService,
    private taskUiDecorator: TaskUiDecoratorService
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

  redecorateCurrentTasks(): void {
    const currentTasks = this.currentTasksSubject.value;
    const redecorated = this.taskUiDecorator.decorateTasks(currentTasks);
    this.currentTasksSubject.next(redecorated);
  }

  async refreshCurrentTasks(): Promise<void> {
    const currentListKey = this.currentListKeySubject.value;
    if (!currentListKey) return;

    const tasks = await this.taskListCoordinator.getTasks(currentListKey);
    this.currentTasksSubject.next(tasks);
  }

  async refreshTasksForKey(listKey: TaskListKey): Promise<void> {
    const tasks = await this.taskListCoordinator.getTasks(listKey);
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  async setTasksByKey(listKey: TaskListKey): Promise<void> {
    const tasks = await this.taskListCoordinator.getTasks(listKey);
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
