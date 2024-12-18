import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
  private idCacheSubject = new BehaviorSubject<Map<string, Set<string>>>(
    new Map()
  );

  idCache$ = this.idCacheSubject.asObservable();

  constructor(private taskCacheService: TaskCacheService) {}

  getTaskGroup(taskId: string): string | undefined {
    return this.taskToGroup.get(taskId);
  }

  removeTaskFromGroup(groupName: string, taskId: string): void {
    const groupChildren = this.idCache.get(groupName);
    if (groupChildren) {
      groupChildren.delete(taskId);
      this.taskToGroup.delete(taskId);
      // if (groupChildren.size === 0) {
      //   this.idCache.delete(groupName);
      // }
    }
    // this.notifyCacheUpdate();
  }

  deleteTask(groupName: string, taskId: string) {
    console.log('deleting: ' + groupName + ' ' + taskId);

    this.removeTaskFromGroup(groupName, taskId);
  }

  clearCache(): void {
    this.idCache.clear();
    this.taskToGroup.clear();
    this.notifyCacheUpdate();
  }

  moveTask(taskId: string, fromGroup: string, toGroup: string): void {
    this.removeTaskFromGroup(fromGroup, taskId);
    this.addTaskToGroup(toGroup, taskId);
    this.notifyCacheUpdate();
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

  addTasks(tasks: ExtendedTask[], groupName?: string): void {
    tasks.forEach((task) => {
      this.taskCacheService.addTaskWithTime(task);
      if (groupName) this.addTaskToGroup(groupName, task.taskId);
    });
  }

  addTaskToGroup(groupName: string, taskId: string): void {
    if (!this.idCache.has(groupName)) {
      this.idCache.set(groupName, new Set());
    }
    this.idCache.get(groupName)?.add(taskId);
    this.taskToGroup.set(taskId, groupName);
    this.notifyCacheUpdate();
  }

  private notifyCacheUpdate(): void {
    this.idCacheSubject.next(new Map(this.idCache));
  }
}
