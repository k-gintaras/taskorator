import { Injectable } from '@angular/core';
import { Task } from 'src/app/models/taskModelManager';
import { ConfigService } from '../core/config.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskManagementStrategy } from '../core/interfaces/task-management-strategy.interface';
import { TaskValidatorService } from '../core/task-validator.service';
import { CoreService } from '../core/core.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService extends CoreService implements TaskManagementStrategy {
  constructor(
    configService: ConfigService,
    private eventBusService: EventBusService,
    private validatorService: TaskValidatorService
  ) {
    super(configService);
  }

  async createTask(task: Task): Promise<Task> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('not logged in');
    }
    if (!this.validatorService.isTaskValid(task)) {
      throw new Error('invalid task, probably because empty');
    }
    const createdTask = await this.apiService.createTask(userId, task);
    this.eventBusService.createTask(createdTask);
    return createdTask;
  }

  async updateTask(task: Task): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('not logged in');
    }
    await this.apiService.updateTask(userId, task);
    this.eventBusService.updateTask(task);
  }

  async createTasks(tasks: Task[]): Promise<Task[]> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('not logged in');
    }
    const createdTasks = await this.apiService.createTasks(userId, tasks);
    this.eventBusService.createTasks(createdTasks);
    return createdTasks;
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('not logged in');
    }
    await this.apiService.updateTasks(userId, tasks);
    this.eventBusService.updateTasks(tasks);
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    const userId = await this.getUserId();
    if (userId) {
      let task = await this.cacheService.getTaskById(taskId);
      if (!task) {
        task = await this.apiService.getTaskById(userId, taskId);
        if (task) {
          await this.cacheService.createTask(task);
        }
      }
      if (task) {
        this.eventBusService.getTaskById(task);
      }
      return task;
    }
    return undefined;
  }

  async getLatestTaskId(): Promise<string | undefined> {
    const userId = await this.getUserId();
    if (userId) {
      let latestTaskId = await this.cacheService.getLatestTaskId();
      if (!latestTaskId) {
        latestTaskId = await this.apiService.getLatestTaskId(userId);
      }
      if (latestTaskId) {
        this.eventBusService.getLatestTaskId(latestTaskId);
      }
      return latestTaskId;
    }
    return undefined;
  }

  async getSuperOverlord(taskId: string): Promise<Task | undefined> {
    const userId = await this.getUserId();
    if (userId) {
      let task = await this.cacheService.getSuperOverlord(taskId);
      console.log('task of task cache: ' + task?.name);
      if (!task) {
        task = await this.apiService.getSuperOverlord(userId, taskId);
        console.log('task of task api: ' + task?.name);

        if (task) {
          await this.cacheService.createTask(task);
        }
      }
      if (task) {
        this.eventBusService.getSuperOverlord(task);
      }
      return task;
    }
    return undefined;
  }

  async getOverlordChildren(taskId: string): Promise<Task[] | undefined> {
    console.log('task getOverlordChildren: ' + taskId);

    const userId = await this.getUserId();
    if (userId) {
      let tasks = await this.cacheService.getOverlordChildren(taskId);
      console.log('getOverlordChildren cache: ');
      console.log(tasks);

      if (!tasks) {
        tasks = await this.apiService.getOverlordChildren(userId, taskId);
        console.log('getOverlordChildren api: ');
        console.log(tasks);
        if (tasks) {
          await this.cacheService.createTasks(tasks);
        }
      }
      if (tasks) {
        this.eventBusService.getOverlordChildren(tasks);
      }
      return tasks;
    }
    return undefined;
  }

  // TODO: we may never use it, due to how heavy it is if 500 tasks or more...
  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      return await this.authService.getCurrentUserId();
    } catch (error) {
      this.handleError(error);
      throw new Error('not logged in');
    }
  }

  private handleError(error: unknown): void {
    this.errorHandlingService.handleError(error);
    throw error;
  }
}
