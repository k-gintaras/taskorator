import { Injectable } from '@angular/core';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { UiTask, TaskoratorTask } from '../../../models/taskModelManager';
import { TaskListService } from '../../sync-api-cache/task-list.service';
import { TaskService } from '../../sync-api-cache/task.service';

/**
 * @use TaskListCoordinatorService it applies filters and colors
 */
@Injectable({
  providedIn: 'root',
})
export class TaskListSimpleService {
  constructor(
    private taskListService: TaskListService,
    private taskService: TaskService
  ) {}

  /**
   * Get tasks for any task list type
   */
  async getTaskList(taskListKey: TaskListKey): Promise<UiTask[] | null> {
    try {
      switch (taskListKey.type) {
        case TaskListType.DAILY:
          return this.taskListService.getDailyTasks();
        case TaskListType.WEEKLY:
          return this.taskListService.getWeeklyTasks();
        case TaskListType.MONTHLY:
          return this.taskListService.getMonthlyTasks();
        case TaskListType.YEARLY:
          return this.taskListService.getYearlyTasks();
        case TaskListType.FOCUS:
          return this.taskListService.getFocusTasks();
        case TaskListType.FROG:
          return this.taskListService.getFrogTasks();
        case TaskListType.FAVORITE:
          return this.taskListService.getFavoriteTasks();
        case TaskListType.LATEST_UPDATED:
          return this.taskListService.getLatestUpdatedTasks();
        case TaskListType.LATEST_CREATED:
          return this.taskListService.getLatestTasks();
        case TaskListType.OVERLORD:
          return this.taskListService.getOverlordTasks(taskListKey.data);
        case TaskListType.SUPER_OVERLORD:
          return this.getSuperOverlordTasks(taskListKey.data);

        // Add new list types here without touching navigation logic
        // case TaskListType.PRIORITY:
        //   return this.taskListService.getPriorityTasks();
        // case TaskListType.SESSION:
        //   return this.sessionService.getSessionTasks(taskListKey.data);
        default:
          console.warn(`Unknown task list type: ${taskListKey.type}`);
          return null;
      }
    } catch (error) {
      console.error('Failed to get task list:', error);
      return null;
    }
  }

  async getSuperOverlordTasks(taskId: string): Promise<UiTask[] | null> {
    const superOverlord = await this.taskService.getSuperOverlord(taskId);
    return superOverlord?.overlord
      ? this.taskListService.getOverlordTasks(superOverlord.overlord)
      : null;
  }
}
