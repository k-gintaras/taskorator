import { Injectable } from '@angular/core';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { BehaviorSubject } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../task-action-tracker.service';
import { TaskListCoordinatorService } from '../task-list/task-list-coordinator.service';
import { TaskUiDecoratorService } from '../task-list/task-ui-decorator.service';
import { TreeUpdateService } from '../../tree/tree-update.service';

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
    private taskUiDecorator: TaskUiDecoratorService,
    private treeService: TreeUpdateService,
  ) {
    this.taskActionService.lastAction$.subscribe((action) => {
      if (!action) return;

      // Always refresh on moved actions so lists that are currently showing
      // a parent update immediately when tasks are moved away.
      if (action.action === TaskActions.MOVED) {
        this.refreshCurrentTasks();
        return;
      }

      if (action.action === TaskActions.CREATED) {
        this.refreshCurrentTasks();
        return;
      }

      if (this.shouldRefreshOnAction(action.action)) {
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

    const tasks =
      (await this.taskListCoordinator.getTasks(currentListKey)) || [];
    this.currentTasksSubject.next(tasks);
  }

  async setTasksByKey(listKey: TaskListKey): Promise<void> {
    const tasks = (await this.taskListCoordinator.getTasks(listKey)) || [];
    if (listKey.type === TaskListType.OVERLORD && typeof listKey.data === 'string') {
      const overlord = listKey.data;
      await this.treeService.syncParentActiveChildren(overlord, tasks as any);
    }
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  async setTasks(tasks: UiTask[]): Promise<void> {
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(null); // No key for custom lists
  }

  getCurrentTasks(): UiTask[] {
    return this.currentTasksSubject.value;
  }

  getCurrentListKey(): TaskListKey | null {
    return this.currentListKeySubject.value;
  }

  /**
   * Sort the current tasks by given order.
   */
  sortCurrentTasks(order: 'date' | 'priority'): void {
    let tasks = this.currentTasksSubject.value.slice();
    if (order === 'date') {
      // Sort by timeCreated (TaskoratorTask property)
      tasks.sort((a, b) => (a.timeCreated || 0) - (b.timeCreated || 0));
    } else if (order === 'priority') {
      tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    this.currentTasksSubject.next(tasks);
  }
}
