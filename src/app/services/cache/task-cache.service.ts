import { Injectable } from '@angular/core';
import { TASK_CONFIG } from '../../app.config';
import { UiTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskCacheService {
  private cache: Map<string, { task: UiTask; timestamp: number }> = new Map();
  private specialKeys: Map<string, string> = new Map(); // Special key -> taskId mapping

  getAllTasks(): UiTask[] {
    return Array.from(this.cache.values()).map((entry) => entry.task);
  }

  addTaskWithTime(task: UiTask) {
    const timestamp = Date.now();
    const data = { task, timestamp };
    this.cache.set(task.taskId, data);
  }
  /**
   * Add a task to the cache.
   */
  addTask(task: UiTask): void {
    this.addTaskWithTime(task);
  }

  removeTask(extendedTask: UiTask) {
    this.cache.delete(extendedTask.taskId);
  }

  /**
   * Retrieve a task by ID.
   */
  getTask(taskId: string): UiTask | null {
    const cached = this.cache.get(taskId);
    if (cached) {
      const isExpired =
        Date.now() - cached.timestamp > TASK_CONFIG.CACHE_EXPIRATION_MS;
      if (isExpired) {
        this.cache.delete(taskId);
        return null;
      }
      return cached.task;
    }
    return null;
  }

  /**
   * Add a special key to reference a specific task.
   */
  setSpecialKey(key: string, taskId: string): void {
    this.specialKeys.set(key, taskId);
  }

  /**
   * Retrieve a task using a special key.
   */
  getTaskBySpecialKey(key: string): UiTask | null {
    const taskId = this.specialKeys.get(key);
    if (!taskId) {
      return null;
    }
    return this.getTask(taskId);
  }

  /**
   * Clear the entire cache.
   */
  clearCache(): void {
    this.cache.clear();
    this.specialKeys.clear();
  }

  /**
   * Retrieve multiple tasks by IDs.
   */
  getTasksByIds(taskIds: string[]): UiTask[] {
    return taskIds
      .map((id) => this.cache.get(id)?.task)
      .filter((task): task is UiTask => task !== null);
  }

  /**
   * Check if a task exists and is not expired.
   */
  hasTask(taskId: string): boolean {
    const cachedTask = this.cache.get(taskId);
    if (!cachedTask) return false;

    if (Date.now() - cachedTask.timestamp > TASK_CONFIG.CACHE_EXPIRATION_MS) {
      this.cache.delete(taskId); // Remove expired task
      return false;
    }
    return true;
  }

  /**
   * Find IDs of tasks that are missing in the cache.
   */
  getMissingTaskIds(taskIds: string[]): string[] {
    return taskIds.filter((id) => !this.cache.has(id));
  }

  // getTasks(): ExtendedTask[] {
  //   return this.cache.entries().map((v) => v.task);
  // }
}
