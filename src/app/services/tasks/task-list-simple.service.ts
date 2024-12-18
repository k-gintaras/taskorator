import { Injectable } from '@angular/core';
import { TaskListService } from './task-list.service';
import { TaskListKey, TaskListType } from '../../models/task-list-model';
import { ExtendedTask, Task } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskListSimpleService {
  constructor(private taskListService: TaskListService) {}

  async getList(taskListKey: TaskListKey): Promise<ExtendedTask[] | null> {
    switch (taskListKey.type) {
      case 'daily':
        return this.taskListService.getDailyTasks();
      case 'weekly':
        return this.taskListService.getWeeklyTasks();
      case 'monthly':
        return this.taskListService.getMonthlyTasks();
      case 'yearly':
        return this.taskListService.getYearlyTasks();
      case 'focus':
        return this.taskListService.getFocusTasks();
      case 'frog':
        return this.taskListService.getFrogTasks();
      case 'favorite':
        return this.taskListService.getFavoriteTasks();
      case 'latestUpdated':
        return this.taskListService.getLatestUpdatedTasks();
      case 'latestCreated':
        return this.taskListService.getLatestTasks();
      case 'overlord':
        return this.taskListService.getOverlordTasks(taskListKey.data);
      // case 'session':
      // should be handled elsewhere with session service as we need to query session, then task ids from session
      //   return this.taskListService.getSessionTasks(taskListKey.data);
      default:
        return null;
    }
  }
}
