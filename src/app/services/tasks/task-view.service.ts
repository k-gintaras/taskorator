import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TaskActions,
  TaskAction,
  TaskActionTrackerService,
} from './task-action-tracker.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { getIdFromKey, TaskListKey } from '../../models/task-list-model';
import { TaskListRulesService } from './task-list-rules.service';

@Injectable({
  providedIn: 'root',
})
export class TaskViewService {
  private tasks: ExtendedTask[] = [];
  private tasksSubject = new BehaviorSubject<ExtendedTask[]>([]);
  tasks$ = this.tasksSubject.asObservable();
  currentTaskListKey: TaskListKey | null = null;

  constructor(
    private actionTracker: TaskActionTrackerService,
    private taskIdService: TaskIdCacheService,
    private taskListRulesService: TaskListRulesService
  ) {
    this.initializeActionListener();
  }

  /**
   * Set the current task list group and refresh the view.
   * @param taskListGroup - The group name of the task list.
   */
  setTasksListGroup(taskListKey: TaskListKey): void {
    this.currentTaskListKey = taskListKey;
    this.updateCurrentList();
  }

  /**
   * Refresh the current task list from the cache and apply rules.
   */
  private updateCurrentList(): void {
    if (!this.currentTaskListKey) {
      this.tasks = [];
      this.tasksSubject.next(this.tasks);
      return;
    }

    const groupName = getIdFromKey(this.currentTaskListKey);
    const ids = this.taskIdService.getGroupTaskIds(groupName);

    let tasks = this.taskIdService.getTasks(ids);

    // Apply rules to tasks using TaskListManagerService
    tasks = this.taskListRulesService.applyRulesToList(
      this.currentTaskListKey,
      tasks
    );

    // this.taskListRulesService.getList(this.currentTaskListKey).;

    this.tasks = tasks;
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
    // Refresh the list to account for additions, removals, or moves
    if (this.currentTaskListKey) {
      if (action.action !== TaskActions.DELETED) this.updateCurrentList();
    }

    // // Apply additional filtering or sorting based on the action
    // switch (action.action) {
    //   case TaskActions.PRIORITY_INCREASED:
    //   case TaskActions.PRIORITY_DECREASED:
    //     this.sortTasksByPriority();
    //     break;
    //   case TaskActions.COMPLETED:
    //   case TaskActions.DELETED:
    //   case TaskActions.SEEN:
    //     this.refreshCurrentTaskList();
    //     break;
    //   default:
    //     break;
    // }
  }
}
