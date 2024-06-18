/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { CacheStrategy } from '../../models/service-strategies/cache-strategy.interface';
import { EventBusService } from './event-bus.service';
import { Score } from '../../models/score';
import { Task } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { TaskSettings } from '../../models/settings';
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
  // look up what task has what id
  private taskMap = new Map<string, Task>();
  // what task has what children
  private immediateChildrenMap = new Map<string, Set<string>>();
  // this allows prevention of adding overlord as itself to a children map
  private currentOverlordMap: Map<string, string> = new Map();

  private taskTreeCache: TaskTree | null = null;
  private settingsCache: TaskSettings | null = null;
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

  clearCache(): void {
    this.taskTreeCache = null;
    this.settingsCache = null;
    this.scoreCache = null;
    this.taskMap.clear();
    this.immediateChildrenMap.clear();
    this.currentOverlordMap.clear();
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    return this.taskMap.get(taskId);
  }

  async getOverlordChildren(taskId: string): Promise<Task[] | undefined> {
    const immediateChildrenIds = this.immediateChildrenMap.get(taskId);
    if (immediateChildrenIds) {
      const immediateChildren = Array.from(immediateChildrenIds)
        .map((childId) => this.taskMap.get(childId))
        .filter((task): task is Task => task !== undefined);
      return immediateChildren;
    } else {
      return undefined;
    }
  }

  private addCacheTask(task: Task): void {
    if (task.stage === 'deleted') {
      console.log(`Deleting task: ${task.taskId}`);
      this.taskMap.delete(task.taskId);
      this.currentOverlordMap.delete(task.taskId);

      // Remove task from its immediate overlord's children set
      const currentOverlord = this.currentOverlordMap.get(task.taskId);
      if (currentOverlord) {
        const childrenIds = this.immediateChildrenMap.get(currentOverlord);
        if (childrenIds && childrenIds.has(task.taskId)) {
          console.log(
            `Removing task ${task.taskId} from overlord ${currentOverlord}`
          );
          childrenIds.delete(task.taskId);
        }
      }

      return; // Exit the function since the task is deleted
    }

    console.log(`Adding/Updating task: ${task.taskId}`);
    this.taskMap.set(task.taskId, task);

    // Remove task from its previous immediate overlord using the reverse lookup map
    const currentOverlord = this.currentOverlordMap.get(task.taskId);
    if (currentOverlord) {
      const childrenIds = this.immediateChildrenMap.get(currentOverlord);
      if (childrenIds && childrenIds.has(task.taskId)) {
        console.log(
          `Removing task ${task.taskId} from overlord ${currentOverlord}`
        );
        childrenIds.delete(task.taskId);
      }
    }

    // Add task to its new immediate overlord, ensuring it's not added to itself
    if (task.overlord && task.taskId !== task.overlord) {
      const childrenIds =
        this.immediateChildrenMap.get(task.overlord) || new Set<string>();
      childrenIds.add(task.taskId);
      this.immediateChildrenMap.set(task.overlord, childrenIds);
      // Update the reverse lookup map
      this.currentOverlordMap.set(task.taskId, task.overlord);
      console.log(`Task ${task.taskId} added to overlord ${task.overlord}`);
    } else if (task.overlord === task.taskId) {
      console.log(`Error: Task ${task.taskId} cannot be its own overlord`);
    }
  }

  createTask(task: Task): Promise<Task> {
    return new Promise((resolve) => {
      const existingTask = this.taskMap.get(task.taskId);
      if (!existingTask) {
        this.addCacheTask(task);
        console.log(`Task ${task.taskId} created in cache.`);
      } else {
        console.log(
          `Attempt to recreate existing task ${task.taskId} avoided.`
        );
      }
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
        console.log('creating cache tasks');
        console.log(task);
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

  async getLatestTaskId(): Promise<string | undefined> {
    return '128';
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

  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
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

  createSettings(settings: TaskSettings): Promise<TaskSettings | null> {
    this.settingsCache = settings;
    return new Promise((resolve) => {
      resolve(this.settingsCache);
    });
  }

  getSettings(): Promise<TaskSettings | null> {
    return new Promise((resolve) => {
      resolve(this.settingsCache);
    });
  }

  updateSettings(settings: TaskSettings): Promise<void> {
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
