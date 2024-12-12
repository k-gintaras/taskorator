import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskCacheService } from './task-cache.service';
import { ExtendedTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskIdCacheService {
  private idCache = new Map<string, Set<string>>(); // Map group name -> task ID set
  private taskToGroup = new Map<string, string>(); // Map task ID -> group name
  private idCacheSubject = new BehaviorSubject<Map<string, Set<string>>>(
    new Map()
  );

  idCache$ = this.idCacheSubject.asObservable();

  constructor(private taskCacheService: TaskCacheService) {}

  /**
   * Retrieve task IDs for a group.
   */
  getGroupTaskIds(groupName: string): string[] {
    return Array.from(this.idCache.get(groupName) || []);
  }

  /**
   * Retrieve tasks by their IDs.
   */
  getTasksByIds(taskIds: string[]): ExtendedTask[] {
    return taskIds
      .map((id) => this.taskCacheService.getTask(id))
      .filter((task): task is ExtendedTask => !!task);
  }

  /**
   * Retrieve tasks purely by their IDs.
   */
  getTasks(taskIds: string[]): ExtendedTask[] {
    return this.getTasksByIds(taskIds);
  }

  /**
   * Get the group name for a specific task.
   */
  getTaskGroup(taskId: string): string | undefined {
    return this.taskToGroup.get(taskId);
  }

  /**
   * Add tasks, optionally assigning them to a group.
   */
  addTasks(tasks: ExtendedTask[], groupName?: string): void {
    tasks.forEach((task) => {
      this.taskCacheService.addTaskWithTime(task);
      if (groupName) {
        this.addTaskToGroup(groupName, task.taskId);
      }
    });
  }

  /**
   * Add a single task to a group.
   */
  addTaskToGroup(groupName: string, taskId: string): void {
    if (!this.idCache.has(groupName)) {
      this.idCache.set(groupName, new Set());
    }
    const group = this.idCache.get(groupName);
    if (group) {
      group.add(taskId);
      this.taskToGroup.set(taskId, groupName);
      this.notifyCacheUpdate();
    }
  }

  /**
   * Remove a single task from a group, if it exists.
   */
  removeTaskFromGroup(groupName: string, taskId: string): void {
    const group = this.idCache.get(groupName);
    if (group) {
      group.delete(taskId);
      this.taskToGroup.delete(taskId);
      if (group.size === 0) {
        this.idCache.delete(groupName);
      }
    }
  }

  /**
   * Clear all tasks in a specific group.
   */
  clearGroup(groupName: string): void {
    const taskIds = this.getGroupTaskIds(groupName);
    taskIds.forEach((taskId) => this.taskToGroup.delete(taskId));
    this.idCache.delete(groupName);
    this.notifyCacheUpdate();
  }

  /**
   * Clear all cached task IDs.
   */
  clearCache(): void {
    this.idCache.clear();
    this.taskToGroup.clear();
    this.notifyCacheUpdate();
  }

  /**
   * Move a task from one group to another.
   */
  moveTask(taskId: string, fromGroup: string, toGroup: string): void {
    this.removeTaskFromGroup(fromGroup, taskId);
    this.addTaskToGroup(toGroup, taskId);
    this.notifyCacheUpdate();
  }

  /**
   * Batch update tasks to a new group.
   */
  batchUpdateTasks(taskIds: string[], toGroup: string): void {
    taskIds.forEach((taskId) => {
      const currentGroup = this.taskToGroup.get(taskId);
      if (currentGroup) {
        this.removeTaskFromGroup(currentGroup, taskId);
      }
      this.addTaskToGroup(toGroup, taskId);
    });
    this.notifyCacheUpdate();
  }

  /**
   * Notify observers of cache updates.
   */
  private notifyCacheUpdate(): void {
    this.idCacheSubject.next(new Map(this.idCache));
  }
}
