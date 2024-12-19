import { Injectable } from '@angular/core';
import { TaskCacheService } from './task-cache.service';
import { ExtendedTask } from '../../models/taskModelManager';
interface TaskListCacheResult {
  tasksWithData: ExtendedTask[]; // Tasks with data in cache
  taskIdsWithoutData: string[]; // Task IDs with no data in cache
  hasGroupAndCachedTasks: boolean; // True if all tasks are in cache
  hasGroupAndSomeCachedTasks: boolean; // True if some tasks are in cache
  hasGroupAndEmptyTasks: boolean; // True if the list exists but has no tasks
  hasGroupAndNotCachedTasks: boolean; // True if the list exists but has no tasks
}

@Injectable({
  providedIn: 'root',
})
export class TaskIdCacheService {
  private idCache = new Map<string, Set<string>>(); // Map group name -> task ID set
  private taskToGroup = new Map<string, string>(); // Map task ID -> group name

  constructor(private taskCacheService: TaskCacheService) {}

  // when moving multiple tasks from various places
  getTaskGroup(taskId: string): string | undefined {
    return this.taskToGroup.get(taskId);
  }

  removeTaskFromGroup(groupName: string, taskId: string): void {
    const groupChildren = this.idCache.get(groupName);
    if (groupChildren) {
      groupChildren.delete(taskId);
      this.taskToGroup.delete(taskId);
      if (groupChildren.size === 0) {
        this.idCache.delete(groupName);
      }
    }
  }

  deleteTask(taskId: string): void {
    // Collect all groups the task belongs to
    const groupsContainingTask: string[] = [];

    // Find all groups containing the task
    for (const [groupName, groupChildren] of this.idCache.entries()) {
      if (groupChildren.has(taskId)) {
        groupsContainingTask.push(groupName);
      }
    }

    // Remove the task from all groups it belongs to
    groupsContainingTask.forEach((groupName) => {
      const groupChildren = this.idCache.get(groupName);
      if (groupChildren) {
        groupChildren.delete(taskId); // Remove task from group
        if (groupChildren.size === 0) {
          this.idCache.delete(groupName); // Delete group if empty
        }
      }
    });

    // Remove task-to-group mapping
    this.taskToGroup.delete(taskId);
  }

  clearCache(): void {
    this.idCache.clear();
    this.taskToGroup.clear();
  }

  moveTask(taskId: string, fromGroup: string, toGroup: string): void {
    this.removeTaskFromGroup(fromGroup, taskId);
    this.addTaskToGroup(toGroup, taskId);
  }

  getTasksByIds(taskIds: string[]): ExtendedTask[] {
    return taskIds
      .map((id) => this.taskCacheService.getTask(id))
      .filter((task): task is ExtendedTask => !!task);
  }

  getListCacheState(groupName: string): TaskListCacheResult | null {
    const cache = this.idCache.get(groupName);

    if (!cache) return null;
    const groupIds = Array.from(cache);
    const tasksWithData = groupIds
      .map((id) => this.taskCacheService.getTask(id))
      .filter((task): task is ExtendedTask => !!task);

    return {
      tasksWithData,
      taskIdsWithoutData: groupIds.filter(
        (id) => !this.taskCacheService.hasTask(id)
      ),
      hasGroupAndCachedTasks: tasksWithData.length === groupIds.length,
      hasGroupAndSomeCachedTasks:
        tasksWithData.length > 0 && tasksWithData.length < groupIds.length,
      hasGroupAndEmptyTasks: groupIds.length === 0,
      hasGroupAndNotCachedTasks:
        groupIds.length > 0 && tasksWithData.length === 0,
    };
  }

  addTasksWithGroup(tasks: ExtendedTask[], groupName: string): void {
    if (!this.idCache.has(groupName)) {
      console.warn(
        `Group ${groupName} does not exist. Skipping task association.`
      );
      return;
    }
    tasks.forEach((task) => {
      this.taskCacheService.addTaskWithTime(task);
      if (this.idCache.has(groupName)) {
        // no point adding to group we don't have from server
        this.addTaskToGroup(groupName, task.taskId);
      }
    });
  }

  createNewGroup(tasks: ExtendedTask[], groupName: string): void {
    tasks.forEach((task) => {
      this.taskCacheService.addTaskWithTime(task);
      this.addTaskToGroup(groupName, task.taskId);
    });
  }

  updateTasks(extendedTasks: ExtendedTask[]) {
    // without group name, if we are not moving.. might aswell just update to cache
    extendedTasks.forEach((t) => {
      this.taskCacheService.addTask(t);
    });
  }

  addTaskToGroup(groupName: string, taskId: string): void {
    if (!this.idCache.has(groupName)) {
      this.idCache.set(groupName, new Set());
    }
    this.idCache.get(groupName)?.add(taskId);
    this.taskToGroup.set(taskId, groupName);
  }
}
