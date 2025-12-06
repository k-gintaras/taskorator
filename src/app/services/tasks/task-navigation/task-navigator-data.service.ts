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
import { TreeService } from '../../sync-api-cache/tree.service';

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
    private treeService: TreeService
  ) {
    this.taskActionService.lastAction$.subscribe((action) => {
      if (!action) return;

      // Always refresh on moved actions so lists that are currently showing
      // a parent update immediately when tasks are moved away.
      // Also rebuild the tree structure since overlord relationships changed
      if (action.action === TaskActions.MOVED) {
        this.refreshCurrentTasks();
        this.treeService.rebuildTree().catch(error => {
          console.error('Failed to rebuild tree after move:', error);
        });
        return;
      }

      // Also rebuild tree on created actions since new tasks need to be added to tree
      if (action.action === TaskActions.CREATED) {
        this.refreshCurrentTasks();
        this.treeService.rebuildTree().catch(error => {
          console.error('Failed to rebuild tree after create:', error);
        });
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

    const tasks = await this.taskListCoordinator.getTasks(currentListKey);
    await this.treeService.ensureTasksInTree(tasks);
    this.currentTasksSubject.next(tasks);
  }

  async refreshTasksForKey(listKey: TaskListKey): Promise<void> {
    const tasks = await this.taskListCoordinator.getTasks(listKey);
    await this.treeService.ensureTasksInTree(tasks);
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  async setTasksByKey(listKey: TaskListKey): Promise<void> {
    const tasks = await this.taskListCoordinator.getTasks(listKey);
    await this.treeService.ensureTasksInTree(tasks);
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
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
