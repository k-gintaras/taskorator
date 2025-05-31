import { Injectable } from '@angular/core';
import { EventBusService } from '../core/event-bus.service';
import { TaskValidatorService } from '../core/task-validator.service';
import { ExtendedTask, Task } from '../../models/taskModelManager';
import { TaskCacheService } from '../cache/task-cache.service';
import { TaskTransmutationService } from '../tasks/task-transmutation.service';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { ErrorService } from '../core/error.service';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private latestTaskId: string | null = null;
  apiService: ApiStrategy | null = null;
  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    console.log('TaskService initialized with API strategy');
  }

  constructor(
    private eventBusService: EventBusService,
    private validatorService: TaskValidatorService,
    private taskCache: TaskCacheService,
    private taskIdCache: TaskIdCacheService,
    private transmutatorService: TaskTransmutationService,
    private errorService: ErrorService
  ) {}

  /**
   * Create a single task.
   */
  async createTask(task: Task): Promise<ExtendedTask> {
    try {
      if (!this.validatorService.isTaskValid(task)) {
        throw new Error('Invalid task, probably because it is empty');
      }
      if (!this.apiService) {
        throw new Error('TaskService api not initialized');
      }

      const createdTask = await this.apiService.createTask(task);
      if (!createdTask) throw new Error('Task creation failed');

      const extendedTask = this.transmutatorService.toExtendedTask(createdTask);
      // this.taskCache.addTask(extendedTask); // Cache the new task
      this.taskIdCache.addTasksWithGroup(
        [extendedTask],
        `overlord_${task.overlord}`
      ); // Notify TaskIdCache of update

      this.eventBusService.createTask(extendedTask);

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
      if (!this.apiService) {
        throw new Error('TaskService api not initialized');
      }
      await this.apiService.updateTask(task);

      const extendedTask = this.transmutatorService.toExtendedTask(task);
      if (task.stage === 'deleted') {
        this.taskCache.removeTask(extendedTask);
        this.taskIdCache.deleteTask(extendedTask.taskId); // Notify TaskIdCache of deletion
        this.feedBack('task deleted' + extendedTask.name);
      } else {
        this.taskIdCache.updateTasks([extendedTask]); // Notify TaskIdCache of update
        // this.taskCache.addTask(extendedTask); // Update the cache
      }
      this.eventBusService.updateTask(extendedTask);
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
        this.eventBusService.getTaskById(cachedTask);

        return cachedTask;
      }

      if (!this.apiService) {
        throw new Error('TaskService api not initialized');
      }
      const task = await this.apiService.getTaskById(taskId);
      if (task) {
        const extendedTask = this.transmutatorService.toExtendedTask(task);
        this.taskCache.addTask(extendedTask); // Cache ExtendedTask
        this.eventBusService.getTaskById(extendedTask);
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
      if (!this.apiService) {
        throw new Error('TaskService api not initialized');
      }
      const latestTask = await this.apiService.getTaskById(this.latestTaskId);
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
      let task = this.taskCache.getTask(taskId) as ExtendedTask | null; // Check cache first
      if (!task) {
        // Fetch from API if not cached
        if (!this.apiService) {
          throw new Error('TaskService api not initialized');
        }
        const superOverlordTask = await this.apiService.getSuperOverlord(
          taskId
        );
        if (superOverlordTask) {
          task = this.transmutatorService.toExtendedTask(superOverlordTask); // Convert to ExtendedTask
          this.taskCache.addTask(task); // Cache the ExtendedTask
        }
      }
      if (task) this.eventBusService.getSuperOverlord(task); // Emit event for listeners
      return task;
    } catch (error) {
      this.handleError('getSuperOverlord', error);
      return null;
    }
  }

  /**
   * Centralized error handling.
   */
  private handleError(method: string, error: unknown): void {
    const message = `TaskService.${method} failed: ${error}`;
    this.errorService.error(message);
    this.errorService.popup(message); // Notify users if needed
  }

  private feedBack(s: string) {
    this.errorService.feedback(s);
  }
}
