import { Injectable } from '@angular/core';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { TaskCacheService } from '../cache/task-cache.service';
import { SettingsService } from '../sync-api-cache/settings.service';
import { TaskSettings } from '../../models/settings';
import { ExtendedTask, TaskoratorTask } from '../../models/taskModelManager';
import {
  getIdFromKey,
  TaskListKey,
  TaskListSubtype,
  TaskListType,
} from '../../models/task-list-model';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { TaskTransmutationService } from '../tasks/task-transmutation.service';
import { EventBusService } from '../core/event-bus.service';

type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type SettingsType = 'focus' | 'frog' | 'favorite';

@Injectable({
  providedIn: 'root',
})
export class TaskListService {
  apiService: ApiStrategy | null = null;
  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    console.log('TaskListService initialized with API strategy');
  }
  private ensureApiService(): ApiStrategy {
    if (!this.apiService) {
      throw new Error('API service is not initialized.');
    }
    return this.apiService;
  }

  // TODO: since here we get superoverlord... we might aswell tell event bus...
  constructor(
    private taskIdCache: TaskIdCacheService,
    private taskCache: TaskCacheService,
    private settingsService: SettingsService,
    private transmutatorService: TaskTransmutationService,
    private eventBusService: EventBusService
  ) {}

  // Main GETTER:
  /**
   * Main GETTER:
   * Retrieves a group of tasks using the cache when possible,
   * and falls back to the API for any missing tasks.
   */
  private async getTaskGroupWithCache(
    taskListKey: TaskListKey,
    fetchFn: () => Promise<TaskoratorTask[] | null>
  ): Promise<ExtendedTask[] | null> {
    const groupName = getIdFromKey(taskListKey);
    const cacheState = this.taskIdCache.getListCacheState(groupName);

    if (cacheState?.hasGroupAndEmptyTasks) {
      console.log(
        'getTaskGroupWithCache: cached and empty ' +
          taskListKey.type +
          taskListKey.data
      );
      this.eventBusService.getTasks([], taskListKey);
      return []; // Known to be empty, no need to fetch
    }

    if (cacheState?.hasGroupAndCachedTasks) {
      console.log(
        'getTaskGroupWithCache: fully cached ' +
          taskListKey.type +
          taskListKey.data
      );

      this.eventBusService.getTasks(cacheState.tasksWithData, taskListKey);

      return cacheState.tasksWithData; // Return fully cached tasks
    }

    // not cached as a list
    if (!cacheState) {
      console.log(
        'getTaskGroupWithCache: no group not cached ' +
          taskListKey.type +
          taskListKey.data
      );
      const fetchAll = (await fetchFn()) || [];
      const converted = this.transmutatorService.toExtendedTasks(fetchAll);
      this.taskIdCache.createNewGroup(converted, groupName);
      this.eventBusService.getTasks(converted, taskListKey);
      return converted;
    }

    // not cached as a list
    if (cacheState.hasGroupAndNotCachedTasks) {
      console.log(
        'getTaskGroupWithCache: has group but not cached tasks ' +
          taskListKey.type +
          taskListKey.data
      );
      const fetchAll = (await fetchFn()) || [];
      const converted = this.transmutatorService.toExtendedTasks(fetchAll);
      this.taskIdCache.createNewGroup(converted, groupName);
      this.eventBusService.getTasks(converted, taskListKey);

      return converted;
    }

    // partially cached, fetch missing, add and return
    if (cacheState?.hasGroupAndSomeCachedTasks) {
      console.log(
        'getTaskGroupWithCache: has group and some cached tasks ' +
          taskListKey.type +
          taskListKey.data
      );
      // Fetch missing tasks from API
      const missingTasks =
        cacheState.taskIdsWithoutData.length > 0
          ? await this.ensureApiService().getTasksFromIds(
              cacheState.taskIdsWithoutData
            )
          : [];

      // Combine cached and fetched tasks
      if (!missingTasks) return null;
      const extendedTasks =
        this.transmutatorService.toExtendedTasks(missingTasks);
      this.taskIdCache.addTasksWithGroup(extendedTasks, groupName);

      const tasksAndMissing = [...cacheState.tasksWithData, ...extendedTasks];
      this.eventBusService.getTasks(tasksAndMissing, taskListKey);

      return tasksAndMissing;
    }
    return null;
  }

  // private getCachedTaskIds(taskListKey: TaskListKey): string[] {
  //   const groupName = getIdFromKey(taskListKey);
  //   return this.taskIdCache.getGroupTaskIds(groupName);
  // }
  private getMissingTaskIds(taskIds: string[]): string[] {
    return taskIds.filter((id) => !this.taskCache.getTask(id));
  }
  private getCachedTasks(taskIds: string[]): ExtendedTask[] {
    return this.taskIdCache.getTasksByIds(taskIds);
  }
  private async fetchMissingTasks(
    missingIds: string[],
    fetchFn: () => Promise<TaskoratorTask[] | null>
  ): Promise<ExtendedTask[] | null> {
    if (missingIds.length === 0) return null;

    const fetchedTasks = await fetchFn();
    return fetchedTasks
      ? this.transmutatorService.toExtendedTasks(fetchedTasks)
      : null;
  }

  private updateCacheAndReturnTasks(
    taskListKey: TaskListKey,
    fetchedTasks: ExtendedTask[],
    cachedTaskIds: string[]
  ): ExtendedTask[] {
    // Add fetched tasks to the specified group
    const groupName = getIdFromKey(taskListKey);
    this.taskIdCache.addTasksWithGroup(fetchedTasks, groupName);

    // Combine cached and fetched tasks
    return [...this.getCachedTasks(cachedTaskIds), ...fetchedTasks];
  }

  async getLatestUpdatedTasks(): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.LATEST_UPDATED,
      data: TaskListSubtype.API,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.ensureApiService().getLatestUpdatedTasks()
    );
  }

  async getLatestTasks(): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.LATEST_CREATED,
      data: TaskListSubtype.API,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.ensureApiService().getLatestCreatedTasks()
    );
  }

  /**
   * Get tasks for a specific overlord as ExtendedTask[]
   */
  async getOverlordTasks(overlordId: string): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.OVERLORD,
      data: overlordId,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.ensureApiService().getOverlordTasks(overlordId)
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
    const typeMap = {
      focus: TaskListType.FOCUS,
      frog: TaskListType.FROG,
      favorite: TaskListType.FAVORITE,
    };

    const ids = idMap[key];
    const type = typeMap[key];
    if (!ids || !type) return null;

    const taskListKey: TaskListKey = {
      type: type,
      data: TaskListSubtype.SETTINGS,
    };
    const tasks = await this.getTasks(ids, taskListKey);
    return tasks ? this.transmutatorService.toExtendedTasks(tasks) : null;
  }

  async getFocusTasks(): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.FOCUS,
      data: TaskListSubtype.SETTINGS,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.getSettingsTasks('focus')
    );
    // return this.getSettingsTasks('focus');
  }

  async getFrogTasks(): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.FROG,
      data: TaskListSubtype.SETTINGS,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.getSettingsTasks('frog')
    );
    // return this.getSettingsTasks('frog');
  }

  async getFavoriteTasks(): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.FAVORITE,
      data: TaskListSubtype.SETTINGS,
    };
    return this.getTaskGroupWithCache(taskListKey, () =>
      this.getSettingsTasks('favorite')
    );
    // return this.getSettingsTasks('favorite');
  }

  /**
   * Generic method to handle repeating tasks, returning ExtendedTask[]
   */
  private async getRepeatingTasks(
    type: RepeatType
  ): Promise<ExtendedTask[] | null> {
    const taskListKey: TaskListKey = {
      type: TaskListType.DAILY,
      data: TaskListSubtype.REPEATING,
    };
    switch (type) {
      case 'daily':
        taskListKey.type = TaskListType.DAILY;
        break;
      case 'weekly':
        taskListKey.type = TaskListType.WEEKLY;
        break;
      case 'monthly':
        taskListKey.type = TaskListType.MONTHLY;
        break;
      case 'yearly':
        taskListKey.type = TaskListType.YEARLY;
        break;
    }

    return this.getTaskGroupWithCache(taskListKey, () => {
      const api = this.ensureApiService();
      const apiMethodMap = {
        daily: api.getDailyTasks.bind(api),
        weekly: api.getWeeklyTasks.bind(api),
        monthly: api.getMonthlyTasks.bind(api),
        yearly: api.getYearlyTasks.bind(api),
      };
      return apiMethodMap[type]();
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
   * @warn do not use, it is ambiguous, what is this list name, what if part of it is missing? how you know if tasks are loose?
   * Get tasks by IDs, dynamically fetching any missing ones.
   */
  private async getTasks(
    ids: string[],
    taskListKey: TaskListKey
  ): Promise<ExtendedTask[] | null> {
    const groupName = getIdFromKey(taskListKey);

    // Retrieve tasks from cache
    const cachedTasks = this.taskIdCache.getTasksByIds(ids);
    const missingIds = ids.filter(
      (id) => !cachedTasks.find((task: ExtendedTask) => task.taskId === id)
    );

    if (missingIds.length > 0) {
      // Fetch missing tasks from the API
      const fetchedTasks = await this.ensureApiService().getTasksFromIds(
        missingIds
      );
      if (fetchedTasks) {
        const extendedFetchedTasks =
          this.transmutatorService.toExtendedTasks(fetchedTasks);

        // Add fetched tasks to the cache
        this.taskIdCache.addTasksWithGroup(extendedFetchedTasks, groupName);

        return [...cachedTasks, ...extendedFetchedTasks];
      }
    }

    return cachedTasks;
  }
}
