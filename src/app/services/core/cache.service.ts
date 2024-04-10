/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { CacheStrategy } from './interfaces/cache-strategy.interface';
import { Score } from 'src/app/models/score';
import { Settings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
import { EventBusService } from './event-bus.service';
import { TaskTree } from 'src/app/models/taskTree';
import { RegisterUserResult } from './interfaces/register-user';
/**
 * @summary
 *
 * eventbus
 *   when stuff is created or updated we just handle it here to make task service more readable
 *   when we get stuff, we dont care, it is just set in task service
 *   we are using this way so that we can later add some functions that depend on what happens when task is created of updated
 */

@Injectable({
  providedIn: 'root',
})
export class CacheService implements CacheStrategy {
  private taskChildrenMap = new Map<string, Task[]>();
  private taskMap = new Map<string, Task>();
  private taskTreeCache: TaskTree | null = null;
  private settingsCache: Settings | null = null;
  private scoreCache: Score | null = null;
  private immediateChildrenMap = new Map<string, Set<string>>();

  constructor(private eventBusService: EventBusService) {
    this.subscribeToTaskEvents();
  }

  // register(
  //   userId: string,
  //   initialTask: Task,
  //   additionalTasks: Task[],
  //   settings: Settings,
  //   score: Score,
  //   tree: TaskTree
  // ): Promise<RegisterUserResult>{
  //   const result: RegisterUserResult = {
  //     success: true,
  //     message: ''
  //   };
  //   return result;
  // }

  private subscribeToTaskEvents(): void {
    // tasks
    this.eventBusService.onEvent<any>('createTask').subscribe((task) => {
      this.createTask(task);
    });
    this.eventBusService.onEvent<any>('createTasks').subscribe((tasks) => {
      this.createTasks(tasks);
    });
    this.eventBusService.onEvent<any>('updateTask').subscribe((task) => {
      this.updateTask(task);
    });
    this.eventBusService.onEvent<any>('updateTasks').subscribe((tasks) => {
      this.updateTasks(tasks);
    });

    // tree
    this.eventBusService.onEvent<any>('createTree').subscribe((tasks) => {
      this.createTree(tasks);
    });
    this.eventBusService.onEvent<any>('updateTree').subscribe((tasks) => {
      this.updateTree(tasks);
    });
    // settings
    this.eventBusService.onEvent<any>('createSettings').subscribe((tasks) => {
      this.createSettings(tasks);
    });
    this.eventBusService.onEvent<any>('updateSettings').subscribe((tasks) => {
      this.updateSettings(tasks);
    });
    // score
    this.eventBusService.onEvent<any>('createScore').subscribe((tasks) => {
      this.createScore(tasks);
    });
    this.eventBusService.onEvent<any>('updateScore').subscribe((tasks) => {
      this.updateScore(tasks);
    });
  }

  clearCache(): void {
    this.taskChildrenMap.clear();
    this.taskMap.clear();
    this.taskTreeCache = null;
    this.settingsCache = null;
    this.scoreCache = null;
    this.immediateChildrenMap.clear();
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    const task = this.taskMap.get(taskId) as Task | undefined;
    return task;
  }

  async getLatestTaskId(): Promise<string | undefined> {
    const allTasks: Task[] = Array.from(this.taskChildrenMap.values()).flat();
    const latestTask = allTasks.sort(
      (a, b) =>
        (b.timeCreated?.getTime() ?? 0) - (a.timeCreated?.getTime() ?? 0)
    )[0];
    return latestTask?.taskId;
  }

  async getSuperOverlord(taskId: string): Promise<Task | undefined> {
    const overlord = this.taskMap.get(taskId);
    if (!overlord) {
      return undefined;
    }
    if (!overlord.overlord) {
      return undefined;
    }
    const superOverlord = this.taskMap.get(overlord.overlord);
    if (!superOverlord) {
      return undefined;
    }
    return superOverlord;
  }

  async getOverlordChildren(taskId: string): Promise<Task[] | undefined> {
    const immediateChildrenIds = this.immediateChildrenMap.get(taskId);

    if (immediateChildrenIds && immediateChildrenIds.size > 0) {
      const immediateChildren = Array.from(immediateChildrenIds)
        .map((childId) => this.taskMap.get(childId))
        .filter((task): task is Task => task !== undefined);
      return immediateChildren;
    } else {
      // Cache is empty or null, return undefined
      return undefined;
    }
  }

  private addCacheTask(task: Task): void {
    this.taskMap.set(task.taskId, task);

    // Remove task from its previous immediate overlord
    for (const [
      overlordId,
      childrenIds,
    ] of this.immediateChildrenMap.entries()) {
      if (childrenIds.has(task.taskId)) {
        childrenIds.delete(task.taskId);
        break;
      }
    }

    // Add task to its new immediate overlord
    if (task.overlord) {
      const childrenIds =
        this.immediateChildrenMap.get(task.overlord) || new Set<string>();
      childrenIds.add(task.taskId);
      this.immediateChildrenMap.set(task.overlord, childrenIds);
    }
  }

  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  createTask(task: Task): Promise<Task> {
    return new Promise((resolve) => {
      this.addCacheTask(task);
      resolve(task);
    });
  }

  updateTask(task: Task): Promise<void> {
    return new Promise((resolve) => {
      this.addCacheTask(task);
      resolve();
    });
  }

  createTasks(tasks: Task[]): Promise<Task[]> {
    return new Promise((resolve) => {
      tasks.forEach((task) => {
        this.addCacheTask(task);
      });
      resolve(tasks);
    });
  }

  updateTasks(tasks: Task[]): Promise<void> {
    return new Promise((resolve) => {
      tasks.forEach((task) => {
        this.addCacheTask(task);
      });
      resolve();
    });
  }

  createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    this.taskTreeCache = taskTree;
    console.log('tree created in cache');
    return new Promise((resolve) => {
      resolve(this.taskTreeCache);
    });
  }

  getTree(): Promise<TaskTree | null> {
    return new Promise((resolve) => {
      resolve(this.taskTreeCache);
    });
  }

  updateTree(taskTree: TaskTree): Promise<void> {
    this.taskTreeCache = taskTree;
    return new Promise((resolve) => {
      resolve();
    });
  }

  createSettings(settings: Settings): Promise<Settings | null> {
    this.settingsCache = settings;
    return new Promise((resolve) => {
      resolve(this.settingsCache);
    });
  }

  getSettings(): Promise<Settings | null> {
    return new Promise((resolve) => {
      resolve(this.settingsCache);
    });
  }

  updateSettings(settings: Settings): Promise<void> {
    this.settingsCache = settings;
    return new Promise((resolve) => {
      resolve();
    });
  }

  createScore(score: Score): Promise<Score | null> {
    this.scoreCache = score;
    return new Promise((resolve) => {
      resolve(this.scoreCache);
    });
  }

  getScore(): Promise<Score | null> {
    return new Promise((resolve) => {
      resolve(this.scoreCache);
    });
  }

  updateScore(score: Score): Promise<void> {
    this.scoreCache = score;
    return new Promise((resolve) => {
      resolve();
    });
  }
}
