import { Injectable } from '@angular/core';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TaskListRouterService {
  private readonly basePath = '/sentinel';

  constructor() {}

  /**
   * Get the route URL for a given task list key
   */
  getRouteUrl(taskListKey: TaskListKey): string {
    switch (taskListKey.type) {
      case TaskListType.DAILY:
        return `${this.basePath}/dailyTasks`;
      case TaskListType.WEEKLY:
        return `${this.basePath}/weeklyTasks`;
      case TaskListType.MONTHLY:
        return `${this.basePath}/monthlyTasks`;
      case TaskListType.YEARLY:
        return `${this.basePath}/yearlyTasks`;
      case TaskListType.LATEST_UPDATED:
        return `${this.basePath}/latestUpdated`;
      case TaskListType.LATEST_CREATED:
        return `${this.basePath}/latestCreated`;
      case TaskListType.FOCUS:
        return `${this.basePath}/focusTasksList`;
      case TaskListType.FROG:
        return `${this.basePath}/frogTasks`;
      case TaskListType.FAVORITE:
        return `${this.basePath}/favorites`;
      case TaskListType.SESSION:
        return `${this.basePath}/session`;
      case TaskListType.OVERLORD:
        // For overlord tasks, could extend to handle specific task IDs
        // return taskListKey.data ? `${this.basePath}/rootTasksList/${taskListKey.data}` : `${this.basePath}/rootTasksList`;
        return `${this.basePath}/rootTasksList`;
      default:
        return this.basePath;
    }
  }

  /**
   * Get route URL from task list type string (convenience method)
   */
  getRouteUrlByType(type: TaskListType, data?: string): string {
    const taskListKey: TaskListKey = { type, data: data ?? '' };
    return this.getRouteUrl(taskListKey);
  }

  /**
   * Check if a route exists for the given task list type
   */
  hasRoute(taskListKey: TaskListKey): boolean {
    const routeMap = {
      [TaskListType.DAILY]: 'dailyTasks',
      [TaskListType.WEEKLY]: 'weeklyTasks',
      [TaskListType.MONTHLY]: 'monthlyTasks', // Add if needed
      [TaskListType.YEARLY]: 'yearlyTasks', // Add if needed
      [TaskListType.LATEST_UPDATED]: 'latestUpdated',
      [TaskListType.LATEST_CREATED]: 'latestCreated',
      [TaskListType.FOCUS]: 'focusTasksList',
      [TaskListType.FROG]: 'frogTasks', // Add if needed
      [TaskListType.FAVORITE]: 'favorites', // Add if needed
      [TaskListType.SESSION]: 'session', // Add if needed
      [TaskListType.OVERLORD]: 'rootTasksList',
    };

    return taskListKey.type in routeMap;
  }

  /**
   * Get all available routes
   */
  getAllRoutes(): Record<TaskListType, string> {
    return {
      [TaskListType.DAILY]: this.getRouteUrlByType(TaskListType.DAILY),
      [TaskListType.WEEKLY]: this.getRouteUrlByType(TaskListType.WEEKLY),
      [TaskListType.MONTHLY]: this.getRouteUrlByType(TaskListType.MONTHLY),
      [TaskListType.YEARLY]: this.getRouteUrlByType(TaskListType.YEARLY),
      [TaskListType.LATEST_UPDATED]: this.getRouteUrlByType(
        TaskListType.LATEST_UPDATED
      ),
      [TaskListType.LATEST_CREATED]: this.getRouteUrlByType(
        TaskListType.LATEST_CREATED
      ),
      [TaskListType.FOCUS]: this.getRouteUrlByType(TaskListType.FOCUS),
      [TaskListType.FROG]: this.getRouteUrlByType(TaskListType.FROG),
      [TaskListType.FAVORITE]: this.getRouteUrlByType(TaskListType.FAVORITE),
      [TaskListType.SESSION]: this.getRouteUrlByType(TaskListType.SESSION),
      [TaskListType.OVERLORD]: this.getRouteUrlByType(TaskListType.OVERLORD),
    };
  }

  /**
   * Parse route URL back to TaskListKey (if needed for reverse mapping)
   */
  parseRouteUrl(url: string): TaskListKey | null {
    const path = url.replace(this.basePath + '/', '');

    const routeToTypeMap: Record<string, TaskListType> = {
      dailyTasks: TaskListType.DAILY,
      weeklyTasks: TaskListType.WEEKLY,
      monthlyTasks: TaskListType.MONTHLY,
      yearlyTasks: TaskListType.YEARLY,
      latestUpdated: TaskListType.LATEST_UPDATED,
      latestCreated: TaskListType.LATEST_CREATED,
      focusTasksList: TaskListType.FOCUS,
      frogTasks: TaskListType.FROG,
      favorites: TaskListType.FAVORITE,
      session: TaskListType.SESSION,
      rootTasksList: TaskListType.OVERLORD,
    };

    const type = routeToTypeMap[path];
    return type ? { type, data: '' } : null;
  }

  /**
   * Navigate to task with proper URL context
   */
  navigateToTask(taskId: string, router: Router, listContext?: string): void {
    if (listContext) {
      router.navigate([`/sentinel/${listContext}/tasks/${taskId}`]);
    } else {
      router.navigate([`/tasks/${taskId}`]);
    }
  }

  /**
   * Get navigation URL for task based on current context
   */
  getTaskUrl(taskId: string, listContext?: string): string {
    if (listContext) {
      return `/sentinel/${listContext}/tasks/${taskId}`;
    }
    return `/tasks/${taskId}`;
  }

  /**
   * Extract context from current URL
   */
  extractContextFromUrl(url: string): {
    listContext?: string;
    taskId?: string;
  } {
    const sentinelMatch = url.match(
      /\/sentinel\/([^\/]+)(?:\/tasks\/([^\/]+))?/
    );
    if (sentinelMatch) {
      return {
        listContext: sentinelMatch[1],
        taskId: sentinelMatch[2],
      };
    }

    const directTaskMatch = url.match(/\/tasks\/([^\/]+)/);
    if (directTaskMatch) {
      return {
        taskId: directTaskMatch[1],
      };
    }

    return {};
  }

  /**
   * Get back URL based on current context
   */
  getBackUrl(listContext?: string): string {
    if (listContext) {
      return `/sentinel/${listContext}`;
    }
    return '/sentinel';
  }
}
