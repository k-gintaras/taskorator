import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TaskActions,
  TaskAction,
  TaskActionTrackerService,
} from './task-action-tracker.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { TaskIdCacheService } from '../cache/task-id-cache.service';

@Injectable({
  providedIn: 'root',
})
export class TaskViewService {
  private tasks: ExtendedTask[] = [];
  private tasksSubject = new BehaviorSubject<ExtendedTask[]>([]);
  tasks$ = this.tasksSubject.asObservable();
  currentTaskListGroup: string | null = null;

  constructor(
    private actionTracker: TaskActionTrackerService,
    private taskIdService: TaskIdCacheService
  ) {
    this.initializeActionListener();
  }

  /**
   * Set the current task list group and refresh the view.
   * @param taskListGroup - The group name of the task list.
   */
  setTasksListGroup(taskListGroup: string): void {
    this.currentTaskListGroup = taskListGroup;
    this.refreshCurrentTaskList();
  }

  /**
   * Refresh the current task list from the cache.
   */
  private refreshCurrentTaskList(): void {
    if (!this.currentTaskListGroup) {
      this.tasks = [];
      this.tasksSubject.next(this.tasks);
      return;
    }

    const ids = this.taskIdService.getGroupTaskIds(this.currentTaskListGroup);

    this.tasks = this.taskIdService.getTasks(ids);
    this.tasksSubject.next(this.tasks);
  }

  /**
   * Listen for task actions and react accordingly.
   */
  private initializeActionListener(): void {
    this.actionTracker.lastAction$.subscribe((action) => {
      if (action) {
        this.reactToAction(action);
      }
    });
  }

  /**
   * React to a task action by refreshing or modifying the current list.
   * @param action - The task action to handle.
   */
  private reactToAction(action: TaskAction): void {
    // Always refresh the list to account for additions, removals, or moves
    if (this.currentTaskListGroup) {
      if (action.action !== 'deleted') this.refreshCurrentTaskList();
    }

    // Apply additional filtering or sorting based on the action
    switch (action.action) {
      case TaskActions.PRIORITY_INCREASED:
      case TaskActions.PRIORITY_DECREASED:
        this.sortTasksByPriority();
        break;
      case TaskActions.COMPLETED:
        this.filterTasksByStage(action.taskIds, 'completed');
        break;
      case TaskActions.DELETED:
        this.filterTasksByStage(action.taskIds, 'deleted');
        break;
      case TaskActions.SEEN:
        this.filterTasksByStage(action.taskIds, 'seen');
        break;
      default:
        break;
    }
  }

  /**
   * Sort tasks by priority and update the subject.
   */
  private sortTasksByPriority(): void {
    this.tasks.sort((a, b) => b.priority - a.priority);
    this.tasksSubject.next(this.tasks);
  }

  /**
   * Filter tasks by a specific stage and update the subject.
   * @param taskIds - The IDs of tasks to filter.
   * @param stage - The stage to filter by.
   */
  private filterTasksByStage(taskIds: string[], stage: string): void {
    this.tasks = this.tasks.filter(
      (task) => !taskIds.includes(task.taskId) || task.stage !== stage
    );
    this.tasksSubject.next(this.tasks);
  }
}
