import { Injectable } from '@angular/core';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { TaskCacheService } from '../cache/task-cache.service';
import { TaskListApiService } from '../api/task-list-api.service';
import { AuthService } from '../core/auth.service';
import { SettingsService } from '../core/settings.service';
import { TaskSettings } from '../../models/settings';
import { ExtendedTask, Task } from '../../models/taskModelManager';
import { TaskTransmutationService } from './task-transmutation.service';

type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type SettingsType = 'focus' | 'frog' | 'favorite';
export enum TaskListKey {
  OVERLORD = 'overlord_',
  FOCUS = 'settings_focus',
  FROG = 'settings_frog',
  FAVORITE = 'settings_favorite',
  DAILY = 'repeating_daily',
  WEEKLY = 'repeating_weekly',
  MONTHLY = 'repeating_monthly',
  YEALRY = 'repeating_yearly',
  CREATED = 'latest_created',
  UPDATED = 'latest_updated',
  SESSION = 'session_',
}

@Injectable({
  providedIn: 'root',
})
export class TaskListService {
  constructor(
    private taskIdCache: TaskIdCacheService,
    private taskCache: TaskCacheService,
    private taskListApi: TaskListApiService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private transmutatorService: TaskTransmutationService
  ) {}

  // Main GETTER:
  /**
   * Main GETTER:
   * Retrieves a group of tasks using the cache when possible,
   * and falls back to the API for any missing tasks.
   */
  private async getTaskGroupWithCache(
    tasksGroupName: string,
    fetchFn: () => Promise<Task[] | null>
  ): Promise<ExtendedTask[] | null> {
    // Retrieve cached task IDs for the group
    const cachedTaskIds = this.getCachedTaskIds(tasksGroupName);

    // If there are no cached task IDs, we must fetch all tasks
    if (cachedTaskIds.length === 0) {
      const fetchedTasks = await fetchFn();
      if (fetchedTasks) {
        const extendedTasks =
          this.transmutatorService.toExtendedTasks(fetchedTasks);
        return this.updateCacheAndReturnTasks(
          tasksGroupName,
          extendedTasks,
          []
        );
      }
      return null; // Fetch failed
    }

    // Check for missing task IDs
    const missingTaskIds = this.getMissingTaskIds(cachedTaskIds);

    // If all tasks are present in the cache, return them directly
    if (missingTaskIds.length === 0) {
      return this.getCachedTasks(cachedTaskIds);
    }

    // Fetch only missing tasks
    const fetchedTasks = await this.fetchMissingTasks(missingTaskIds, fetchFn);
    if (fetchedTasks) {
      return this.updateCacheAndReturnTasks(
        tasksGroupName,
        fetchedTasks,
        cachedTaskIds
      );
    }

    return null; // Fetch failed
  }

  private getCachedTaskIds(tasksGroupName: string): string[] {
    return this.taskIdCache.getGroupTaskIds(tasksGroupName);
  }
  private getMissingTaskIds(taskIds: string[]): string[] {
    return taskIds.filter((id) => !this.taskCache.getTask(id));
  }
  private getCachedTasks(taskIds: string[]): ExtendedTask[] {
    return this.taskIdCache.getTasksByIds(taskIds);
  }
  private async fetchMissingTasks(
    missingIds: string[],
    fetchFn: () => Promise<Task[] | null>
  ): Promise<ExtendedTask[] | null> {
    if (missingIds.length === 0) return null;

    const userId = await this.getUserId();
    if (!userId) return null;

    const fetchedTasks = await fetchFn();
    return fetchedTasks
      ? this.transmutatorService.toExtendedTasks(fetchedTasks)
      : null;
  }

  private updateCacheAndReturnTasks(
    groupName: string,
    fetchedTasks: ExtendedTask[],
    cachedTaskIds: string[]
  ): ExtendedTask[] {
    // Add fetched tasks to the specified group
    this.taskIdCache.addTasks(fetchedTasks, groupName);

    // Combine cached and fetched tasks
    return [...this.getCachedTasks(cachedTaskIds), ...fetchedTasks];
  }

  async getLatestUpdatedTasks(): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(TaskListKey.UPDATED, () =>
      this.taskListApi.getLatestUpdatedTasks(userId)
    );
  }

  async getLatestTasks(): Promise<Task[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(TaskListKey.CREATED, () =>
      this.taskListApi.getLatestTasks(userId)
    );
  }

  /**
   * Get tasks for a specific overlord as ExtendedTask[]
   */
  async getOverlordTasks(overlordId: string): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(`overlord_${overlordId}`, () =>
      this.taskListApi.getOverlordTasks(userId, overlordId)
    );
  }

  /**
   * Generic method to handle settings-based tasks, returning ExtendedTask[]
   */
  private async getSettingsTasks(
    key: SettingsType
  ): Promise<ExtendedTask[] | null> {
    const settings: TaskSettings | null =
      await this.settingsService.getSettingsOnce();
    if (!settings) return null;

    const idMap = {
      focus: settings.focusTaskIds,
      frog: settings.frogTaskIds,
      favorite: settings.favoriteTaskIds,
    };

    const ids = idMap[key];
    if (!ids) return null;

    const tasks = await this.getTasks(ids);
    return tasks ? this.transmutatorService.toExtendedTasks(tasks) : null;
  }

  async getFocusTasks(): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(TaskListKey.FOCUS, () =>
      this.getSettingsTasks('focus')
    );
    // return this.getSettingsTasks('focus');
  }

  async getFrogTasks(): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(TaskListKey.FROG, () =>
      this.getSettingsTasks('frog')
    );
    // return this.getSettingsTasks('frog');
  }

  async getFavoriteTasks(): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return [];

    return this.getTaskGroupWithCache(TaskListKey.FAVORITE, () =>
      this.getSettingsTasks('focus')
    );
    // return this.getSettingsTasks('favorite');
  }

  /**
   * Generic method to handle repeating tasks, returning ExtendedTask[]
   */
  private async getRepeatingTasks(
    type: RepeatType
  ): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    return this.getTaskGroupWithCache(`repeating_${type}`, () => {
      const apiMethodMap = {
        daily: this.taskListApi.getDailyTasks.bind(this.taskListApi),
        weekly: this.taskListApi.getWeeklyTasks.bind(this.taskListApi),
        monthly: this.taskListApi.getMonthlyTasks.bind(this.taskListApi),
        yearly: this.taskListApi.getYearlyTasks.bind(this.taskListApi),
      };
      return apiMethodMap[type](userId);
    });
  }

  async getDailyTasks(): Promise<ExtendedTask[] | null> {
    return this.getRepeatingTasks('daily');
  }

  async getWeeklyTasks(): Promise<ExtendedTask[] | null> {
    return this.getRepeatingTasks('weekly');
  }

  async getMonthlyTasks(): Promise<ExtendedTask[] | null> {
    return this.getRepeatingTasks('monthly');
  }

  async getYearlyTasks(): Promise<ExtendedTask[] | null> {
    return this.getRepeatingTasks('yearly');
  }

  /**
   * Get tasks by IDs, dynamically fetching any missing ones.
   */
  async getTasks(ids: string[]): Promise<ExtendedTask[] | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    // Retrieve tasks from cache
    const cachedTasks = this.taskIdCache.getTasksByIds(ids);
    const missingIds = ids.filter(
      (id) => !cachedTasks.find((task) => task.taskId === id)
    );

    if (missingIds.length > 0) {
      // Fetch missing tasks from the API
      const fetchedTasks = await this.taskListApi.getTasksFromIds(
        userId,
        missingIds
      );
      if (fetchedTasks) {
        const extendedFetchedTasks =
          this.transmutatorService.toExtendedTasks(fetchedTasks);

        // Add fetched tasks to the cache
        this.taskIdCache.addTasks(extendedFetchedTasks);

        return [...cachedTasks, ...extendedFetchedTasks];
      }
    }

    return cachedTasks;
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      return await this.authService.getCurrentUserId();
    } catch (error) {
      throw new Error('Not logged in');
    }
  }
}
