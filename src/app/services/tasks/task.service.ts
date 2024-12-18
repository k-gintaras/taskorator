import { Injectable } from '@angular/core';
import { EventBusService } from '../core/event-bus.service';
import { TaskValidatorService } from '../core/task-validator.service';
import { ExtendedTask, Task } from '../../models/taskModelManager';
import { TaskCacheService } from '../cache/task-cache.service';
import { TaskApiService } from '../api/task-api.service';
import { AuthService } from '../core/auth.service';
import { TaskTransmutationService } from './task-transmutation.service';
import { TaskActions } from './task-action-tracker.service';
import { TaskIdCacheService } from '../cache/task-id-cache.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private latestTaskId: string | null = null;

  constructor(
    private eventBusService: EventBusService,
    private validatorService: TaskValidatorService,
    private taskCache: TaskCacheService,
    private taskIdCache: TaskIdCacheService,
    private apiService: TaskApiService,
    private authService: AuthService,
    private transmutatorService: TaskTransmutationService
  ) {}

  /**
   * Create a single task.
   */
  async createTask(task: Task): Promise<ExtendedTask> {
    try {
      if (!this.validatorService.isTaskValid(task)) {
        throw new Error('Invalid task, probably because it is empty');
      }
      const userId = await this.getUserId();

      const createdTask = await this.apiService.createTask(userId, task);
      if (!createdTask) throw new Error('Task creation failed');

      const extendedTask = this.transmutatorService.toExtendedTask(createdTask);
      // this.taskCache.addTask(extendedTask); // Cache the new task
      this.taskIdCache.addTasks([extendedTask], `overlord_${task.overlord}`); // Notify TaskIdCache of update

      this.eventBusService.createTask(extendedTask.taskId);
      return extendedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  async updateTask(task: Task): Promise<void> {
    try {
      if (!this.validatorService.isTaskValid(task)) {
        throw new Error('Invalid task, probably because it is empty');
      }
      const userId = await this.getUserId();
      await this.apiService.updateTask(userId, task);

      const extendedTask = this.transmutatorService.toExtendedTask(task);
      if (task.stage === 'deleted') {
        this.taskCache.removeTask(extendedTask);
        this.taskIdCache.deleteTask(
          `overlord_${task.overlord}`,
          extendedTask.taskId
        ); // Notify TaskIdCache of deletion
      } else {
        this.taskIdCache.addTasks([extendedTask]); // Notify TaskIdCache of update
        this.taskCache.addTask(extendedTask); // Update the cache
        this.eventBusService.updateTask(extendedTask.taskId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Retrieve a task by its ID, checking cache first
   */
  async getTaskById(taskId: string): Promise<ExtendedTask | null> {
    try {
      const cachedTask = this.taskCache.getTask(taskId) as ExtendedTask | null;
      if (cachedTask) {
        return cachedTask;
      }

      const userId = await this.getUserId();
      const task = await this.apiService.getTaskById(userId, taskId);
      if (task) {
        const extendedTask = this.transmutatorService.toExtendedTask(task);
        this.taskCache.addTask(extendedTask); // Cache ExtendedTask
        this.eventBusService.getTaskById(extendedTask.taskId);
        return extendedTask;
      } else {
        console.log(`Task ${taskId} not found`);
      }
      return null;
    } catch (error) {
      this.handleError('getTaskById', error);
      return null;
    }
  }

  /**
   * Set the latest task and cache it as an ExtendedTask.
   */
  async setLatestTask(task: Task): Promise<void> {
    this.latestTaskId = task.taskId;
    const extendedTask = this.transmutatorService.toExtendedTask(task); // Convert to ExtendedTask
    this.taskCache.addTask(extendedTask); // Cache the ExtendedTask
  }

  /**
   * Retrieve the latest task as an ExtendedTask (cached or API).
   */
  async getLatestTask(): Promise<ExtendedTask | null> {
    if (this.latestTaskId) {
      // Check cache first
      const cachedTask = this.taskCache.getTask(
        this.latestTaskId
      ) as ExtendedTask | null;
      if (cachedTask) {
        return cachedTask;
      }

      // Fetch from API if not in cache
      const userId = await this.getUserId();
      const latestTask = await this.apiService.getTaskById(
        userId,
        this.latestTaskId
      );
      if (latestTask) {
        const extendedTask =
          this.transmutatorService.toExtendedTask(latestTask); // Convert to ExtendedTask
        this.taskCache.addTask(extendedTask); // Cache the ExtendedTask
        return extendedTask;
      }
    }
    return null; // No latest task found
  }

  /**
   * Retrieve the super-overlord for a task as an ExtendedTask.
   * @warn pass correct task.taskId or task.overlord to retrieve correct parent or super parent
   * @input task.taskId or task.overlord
   * @returns overlord or superoverlord
   */
  async getSuperOverlord(taskId: string): Promise<ExtendedTask | null> {
    try {
      const userId = await this.getUserId();
      let task = this.taskCache.getTask(taskId) as ExtendedTask | null; // Check cache first
      if (!task) {
        // Fetch from API if not cached
        const superOverlordTask = await this.apiService.getSuperOverlord(
          userId,
          taskId
        );
        if (superOverlordTask) {
          task = this.transmutatorService.toExtendedTask(superOverlordTask); // Convert to ExtendedTask
          this.taskCache.addTask(task); // Cache the ExtendedTask
          this.eventBusService.getSuperOverlord(task.taskId); // Emit event for listeners
        }
      }
      return task;
    } catch (error) {
      this.handleError('getSuperOverlord', error);
      return null;
    }
  }

  /**
   * Private helper to get the current user ID.
   */
  private async getUserId(): Promise<string> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) throw new Error('Not logged in');
      return userId;
    } catch (error) {
      this.handleError('getUserId', error);
      throw error;
    }
  }

  /**
   * Centralized error handling.
   */
  private handleError(method: string, error: unknown): void {
    console.error(`TaskService.${method} failed:`, error);
  }
}
