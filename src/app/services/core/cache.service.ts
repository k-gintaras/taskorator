/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { CacheStrategy } from './interfaces/cache-strategy.interface';
import { Observable, of } from 'rxjs';
import { Score } from 'src/app/models/score';
import { Settings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
import { EventBusService } from './event-bus.service';
import { TaskTree } from 'src/app/models/taskTree';
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

  constructor(private eventBusService: EventBusService) {
    this.subscribeToTaskEvents();
  }

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

  getTaskById(taskId: string): Observable<Task | undefined> {
    const task = this.taskChildrenMap.get(taskId) as Task | undefined;
    return of(task);
  }

  getLatestTaskId(): Observable<string | undefined> {
    const allTasks: Task[] = Array.from(this.taskChildrenMap.values()).flat();
    const latestTask = allTasks.sort(
      (a, b) =>
        (b.timeCreated?.getTime() ?? 0) - (a.timeCreated?.getTime() ?? 0)
    )[0];
    return of(latestTask?.taskId);
  }

  getSuperOverlord(taskId: string): Observable<Task | undefined> {
    const overlord = this.taskMap.get(taskId);
    if (!overlord) {
      return of(undefined);
    }
    if (!overlord.overlord) {
      return of(undefined);
    }
    const superOverlord = this.taskMap.get(overlord.overlord);
    if (!superOverlord) {
      return of(undefined);
    }
    return of(superOverlord);
  }

  getOverlordChildren(taskId: string): Observable<Task[] | undefined> {
    const cachedTasks = this.taskChildrenMap.get(taskId);
    if (!cachedTasks) {
      return of(undefined);
    }
    return of(cachedTasks);
  }

  // TODO: are we allowed to get all tasks? ... cache
  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  getCacheTasks(taskId: string): Observable<Task[] | Task | undefined> {
    return of(this.taskChildrenMap.get(taskId));
  }

  addCacheTasks(taskId: string, tasks: Task[]): void {
    this.taskChildrenMap.set(taskId, tasks);

    tasks.forEach((task) => {
      this.taskMap.set(task.taskId, task);
    });
  }

  addCacheTask(task: Task): void {
    this.taskMap.set(task.taskId, task);

    if (task.overlord) {
      const children = this.taskChildrenMap.get(task.overlord) || [];

      const index = children.findIndex((t) => t.taskId === task.taskId);
      if (index === -1) {
        children.push(task);
      } else {
        children[index] = task;
      }
      this.taskChildrenMap.set(task.overlord, children);
    }
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
