import { Injectable } from '@angular/core';
import {
  TaskListStrategy,
  TaskListType,
} from '../../../models/service-strategies/task-list-strategy.interface';
import { Task } from '../../../models/taskModelManager';
import { AuthService } from '../../core/auth.service';
import { TaskListApiService } from './task-list-api.service';
import { TaskListCacheService } from './task-list-cache.service';
import { TaskSettings } from '../../../models/settings';
import { SettingsService } from '../../core/settings.service';
import { TreeService } from '../../core/tree.service';
import { TaskListAssistantService } from './task-list-assistant.service';
import { TaskTreeNode } from '../../../models/taskTree';
import { CoreService } from '../../core/core.service';
import { ConfigService } from '../../core/config.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

/**
 * TaskListService provides an abstracted interface to manage different types of task lists,
 *
 * Usage:
 * This service is designed to be used as a central access point for all task list manipulations
 */
@Injectable({
  providedIn: 'root',
})
export class TaskListService extends CoreService implements TaskListStrategy {
  private title = new BehaviorSubject<string | null>(null);

  constructor(
    configService: ConfigService,
    private taskListCacheService: TaskListCacheService,
    private taskListApiService: TaskListApiService,
    private settingsService: SettingsService,
    private taskTreeService: TreeService,
    private taskListAssistant: TaskListAssistantService
  ) {
    super(configService);
  }

  getSelectedTitleObservable(): Observable<string | null> {
    return this.title.asObservable();
  }

  getSelectedTitle(): string | null {
    return this.title.value;
  }

  setSelectedTitle(t: string) {
    console.log(t);
    this.title.next(t);
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      return await this.authService.getCurrentUserId();
    } catch (error) {
      throw new Error('Not logged in');
    }
  }

  async getLatestTasks(): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getLatestTasks();
        if (!tasks) {
          tasks = await this.taskListApiService.getLatestTasks(userId);
          if (tasks) {
            await this.taskListCacheService.createTaskList('latest', tasks);
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getLatestTasks:', error);
      throw error;
    }
  }

  async getLatestUpdatedTasks(): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getLatestUpdatedTasks();
        if (!tasks) {
          tasks = await this.taskListApiService.getLatestUpdatedTasks(userId);
          if (tasks) {
            await this.taskListCacheService.createTaskList(
              'latestUpdated',
              tasks
            );
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getLatestUpdatedTasks:', error);
      throw error;
    }
  }

  async getOverlordTasks(taskId: string): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getOverlordTasks(taskId);
        if (!tasks) {
          tasks = await this.taskListApiService.getOverlordTasks(
            userId,
            taskId
          );
          if (tasks) {
            await this.taskListCacheService.createOverlordTasks(taskId, tasks);
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getOverlordTasks:', error);
      throw error;
    }
  }

  async getDailyTasks(): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getDailyTasks();
        if (!tasks) {
          tasks = await this.taskListApiService.getDailyTasks(userId);
          if (tasks) {
            await this.taskListCacheService.createTaskList('daily', tasks);
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getDailyTasks:', error);
      throw error;
    }
  }

  async getDailyTasksFiltered(): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getDailyTasks();
        if (!tasks) {
          tasks = await this.taskListApiService.getDailyTasks(userId, true);
          if (tasks) {
            await this.taskListCacheService.createTaskList('daily', tasks);
          }
        }

        // Apply filtering if tasks are retrieved from cache
        if (tasks) {
          tasks = this.taskListAssistant.filterTasks(tasks, true, 'daily');
        }

        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getDailyTasksFiltered:', error);
      throw error;
    }
  }

  async getWeeklyTasks(): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.taskListCacheService.getWeeklyTasks();
        if (!tasks) {
          tasks = await this.taskListApiService.getWeeklyTasks(userId);
          if (tasks) {
            await this.taskListCacheService.createTaskList('weekly', tasks);
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getWeeklyTasks:', error);
      throw error;
    }
  }

  async getFocusTasks(): Promise<Task[] | null> {
    try {
      const settings = await this.settingsService.getSettingsOnce();
      const userId = await this.getUserId();

      if (settings && userId) {
        const focusIds = settings.focusTaskIds;
        let tasks = await this.taskListCacheService.getFocusTasks();

        if (!tasks || tasks.length !== focusIds.length) {
          tasks = await this.taskListApiService.getTasksFromIds(
            userId,
            focusIds
          );
          if (tasks) {
            await this.taskListCacheService.createTaskList('focus', tasks);
          }
        }

        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getFocusTasks:', error);
      throw error;
    }
  }

  /**
   * Retrieves tasks that should be split into smaller tasks.
   * These tasks are identified by having a significant number of total descendants
   * or by being deeply nested within the task tree.
   * @returns A promise that resolves to an array of tasks that should be split.
   */
  async getTasksToSplit(): Promise<Task[] | null> {
    try {
      const tree = await this.taskTreeService.getTreeOnce();
      if (!tree) return null;

      const userId = await this.getUserId();
      const tasksToSplit = this.taskListAssistant
        .getTasksToSplit(tree)
        .map((n: TaskTreeNode) => n.taskId);

      if (tasksToSplit && userId) {
        let tasks = await this.taskListCacheService.getTasksToSplit();

        if (!tasks || tasks.length !== tasksToSplit.length) {
          tasks = await this.taskListApiService.getTasksFromIds(
            userId,
            tasksToSplit
          );
          if (tasks) {
            await this.taskListCacheService.createTaskList('split', tasks);
          }
        }

        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getTasksToSplit:', error);
      throw error;
    }
  }

  /**
   * Retrieves tasks that should be crushed and organized.
   * These tasks have a high number of immediate children and can become bottlenecks.
   * @returns A promise that resolves to an array of tasks that should be crushed.
   */
  async getTasksToCrush(): Promise<Task[] | null> {
    try {
      const tree = await this.taskTreeService.getTreeOnce();
      if (!tree) return null;

      const userId = await this.getUserId();
      const tasksToCrush = this.taskListAssistant
        .getTasksToCrush(tree)
        .map((n: TaskTreeNode) => n.taskId);

      if (tasksToCrush && userId) {
        let tasks = await this.taskListCacheService.getTasksToCrush();

        if (!tasks || tasks.length !== tasksToCrush.length) {
          tasks = await this.taskListApiService.getTasksFromIds(
            userId,
            tasksToCrush
          );
          if (tasks) {
            await this.taskListCacheService.createTaskList('crush', tasks);
          }
        }

        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getTasksToCrush:', error);
      throw error;
    }
  }

  getTasks(taskListType: TaskListType): Promise<Task[] | null> {
    throw new Error('Method not implemented.');
  }

  async getTasksFromIds(taskIds: string[]): Promise<Task[] | null> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        // Attempt to get tasks from cache
        let tasks = await this.taskListCacheService.getTasksFromIds(taskIds);
        if (!tasks) {
          // If not in cache, fetch from API
          tasks = await this.taskListApiService.getTasksFromIds(
            userId,
            taskIds
          );
          if (tasks) {
            // Cache the fetched tasks
            await this.taskListCacheService.createLooseTasks(tasks);
          }
        }
        return tasks;
      }
      return null;
    } catch (error) {
      console.error('Error in getTasksFromIds:', error);
      throw error;
    }
  }
}
