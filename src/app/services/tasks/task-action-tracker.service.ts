import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum TaskActions {
  // other actions
  VIEWED = 'viewed',
  // actual actions
  SELECTED = 'selected',
  MOVED = 'moved',
  CREATED = 'created',
  UPDATED = 'updated',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  RENEWED = 'renewed',
  SEEN = 'seen',
  ACTIVATED = 'activated',
  PRIORITY_INCREASED = 'priorityIncreased',
  PRIORITY_DECREASED = 'priorityDecreased',
  NAME_UPDATED = 'nameUpdated',
  TODO_UPDATED = 'todoUpdated',
  WHY_UPDATED = 'whyUpdated',
  TAG_ADDED = 'tagAdded',
  TAG_REMOVED = 'tagRemoved',
  IMAGE_UPDATED = 'imageUpdated',
  BACKUP_LINK_UPDATED = 'backupLinkUpdated',
  REPEAT_UPDATED = 'repeatUpdated',
  TIME_END_UPDATED = 'timeEndUpdated',
  DURATION_UPDATED = 'durationUpdated',
  STATUS_UPDATED = 'statusUpdated',
  TYPE_UPDATED = 'typeUpdated',
  SUBTYPE_UPDATED = 'subtypeUpdated',
  SIZE_UPDATED = 'sizeUpdated',
}

export interface TaskAction {
  taskIds: string[];
  action: TaskActions; // Action performed (e.g., 'moved', 'created', etc.)
  subAction?: string; // Sub-action details (e.g., 'updated type to X')
  message: string; // Optional descriptive message for batch updates
}

@Injectable({
  providedIn: 'root',
})
export class TaskActionTrackerService {
  private lastActionSubject = new BehaviorSubject<TaskAction | null>(null);
  lastAction$ = this.lastActionSubject.asObservable();

  constructor() {}
  /**
   * Record a single task action.
   * @param taskId - ID of the task.
   * @param action - Action performed (e.g., 'updated', 'completed').
   * @param subAction - Optional sub-action details (e.g., 'updated type to X').
   */
  recordAction(taskId: string, action: TaskActions, subAction?: any): void {
    const actionRecord: TaskAction = {
      taskIds: [taskId],
      action,
      subAction,
      message: subAction
        ? `Task ${taskId} ${action} (${subAction})`
        : `Task ${taskId} ${action}`,
    };
    this.lastActionSubject.next(actionRecord);
  }

  /**
   * Record a batch action.
   * @param taskIds - Array of task IDs.
   * @param action - Action performed (e.g., 'moved', 'updated').
   * @param subAction - Optional sub-action details (e.g., 'updated type to X').
   */
  recordBatchAction(
    taskIds: string[],
    action: TaskActions,
    subAction?: string
  ): void {
    const actionRecord: TaskAction = {
      taskIds,
      action,
      subAction,
      message: subAction
        ? `${taskIds.length} tasks ${action} (${subAction})`
        : `${taskIds.length} tasks ${action}`,
    };
    this.lastActionSubject.next(actionRecord);
  }

  /**
   * Retrieve the last recorded action.
   * @returns The last TaskAction or null if no action was recorded.
   */
  getLastAction(): TaskAction | null {
    return this.lastActionSubject.getValue();
  }
}
