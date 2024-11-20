import { Injectable } from '@angular/core';
import { ConfigService } from '../core/config.service';
import { CoreService } from '../core/core.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskManagementStrategy } from '../../models/service-strategies/task-management-strategy.interface';
import { TaskValidatorService } from '../core/task-validator.service';
import { Task, ROOT_TASK_ID, getBaseTask } from '../../models/taskModelManager';

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

  async createTasksQuietly(tasks: Task[]) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }
      const createdTasks = await this.apiService.createTasks(userId, tasks);
      // this.eventBusService.createTasks(createdTasks);
      this.feedback('Tasks created successfully');
      return createdTasks;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createTask(task: Task): Promise<Task> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }
      if (!this.validatorService.isTaskValid(task)) {
        throw new Error('Invalid task, probably because it is empty');
      }
      const createdTask = await this.apiService.createTask(userId, task);
      this.eventBusService.createTask(createdTask);
      this.feedback('Task created successfully');
      return createdTask;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }
      await this.apiService.updateTask(userId, task);
      this.eventBusService.updateTask(task);
      this.feedback('Task updated successfully');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createTasks(tasks: Task[]): Promise<Task[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }
      const createdTasks = await this.apiService.createTasks(userId, tasks);
      this.eventBusService.createTasks(createdTasks);
      this.feedback('Tasks created successfully');
      return createdTasks;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('Not logged in');
      }
      await this.apiService.updateTasks(userId, tasks);
      this.eventBusService.updateTasks(tasks);
      this.feedback('Tasks updated successfully');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.log(
          `No user logged in, cannot retrieve or create task with ID ${taskId}`
        );
        return undefined; // Early exit if no user is logged in
      }

      let task = await this.cacheService.getTaskById(taskId);
      if (task) {
        // this.log(`Task with ID ${taskId} retrieved from cache`);
        return task;
      }

      task = await this.apiService.getTaskById(userId, taskId);
      if (!task && taskId === ROOT_TASK_ID) {
        // Check if the root task is already in the cache to avoid recreating it
        task = await this.cacheService.getTaskById(ROOT_TASK_ID);
        if (!task) {
          const baseTask = getBaseTask();
          task = await this.apiService.createTask(userId, baseTask);
          await this.cacheService.createTask(task);
          this.log(
            `Root task with ID ${taskId} was recreated and cached successfully`
          );
        } else {
          this.log(`Root task with ID ${taskId} already exists in cache`);
        }
      } else if (task) {
        await this.cacheService.createTask(task);
        this.log(`Task with ID ${taskId} retrieved from API and cached`);
      } else {
        this.log(`Task with ID ${taskId} not found in API or cache`);
      }

      if (task) {
        this.eventBusService.getTaskById(task);
        this.log(`Task with ID ${taskId} retrieved successfully`);
      }
      return task;
    } catch (error) {
      this.log(`Error retrieving task with ID ${taskId}: ${error}`);
      this.handleError(error);
      throw error;
    }
  }

  async getLatestTaskId(): Promise<string | undefined> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let latestTaskId = await this.cacheService.getLatestTaskId();
        if (!latestTaskId) {
          latestTaskId = await this.apiService.getLatestTaskId(userId);
        }
        if (latestTaskId) {
          this.eventBusService.getLatestTaskId(latestTaskId);
          this.log(`Latest task ID retrieved: ${latestTaskId}`);
        } else {
          this.log('No latest task ID found');
        }
        return latestTaskId;
      }
      return undefined;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getSuperOverlord(taskId: string): Promise<Task | undefined> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        /**
         * TODO: cache singular task, but when getting overlordChildren, it should not just get this task, just because it was fetched as 1 task
         *
         * when going back it doesnt give full list of children, because single child from those children was fetched
         * that single child was super overlord
         * but it can also be a child of another overlord that has many children
         * now that overlord has just 1 child...
         * anywya...
         * complicated
         * we just fetch from server task by task
         */
        let task = null; // cache will wrongly return this one task if we ask for tasks of this task parent...
        // let task = await this.cacheService.getSuperOverlord(taskId);
        if (!task) {
          task = await this.apiService.getSuperOverlord(userId, taskId);
          if (task) {
            // await this.cacheService.createTask(task);
          }
        }
        if (task) {
          this.eventBusService.getSuperOverlord(task);
          this.log(
            `Super overlord task for task ID ${taskId} retrieved successfully`
          );
        } else {
          this.log(`No super overlord task found for task ID ${taskId}`);
        }
        return task;
      }
      return this.getTaskById(ROOT_TASK_ID);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getOverlordChildren(taskId: string): Promise<Task[] | undefined> {
    try {
      const userId = await this.getUserId();
      if (userId) {
        let tasks = await this.cacheService.getOverlordChildren(taskId);
        if (tasks) {
          this.log(
            `Found ${tasks.length} tasks in cache for task ID ${taskId}`
          );
        } else {
          this.log(
            `No tasks found in cache for task ID ${taskId}, checking API`
          );
          tasks = await this.apiService.getOverlordChildren(userId, taskId);
          if (tasks) {
            this.log(
              `Retrieved ${tasks.length} tasks from API for task ID ${taskId}`
            );
            await this.cacheService.createTasks(tasks);
          }
        }
        if (tasks) {
          this.eventBusService.getOverlordChildren(tasks);
          this.log(
            `Overlord children tasks for task ID ${taskId} retrieved successfully, total count: ${tasks.length}`
          );
        } else {
          this.log(
            `No overlord children tasks found after checking both cache and API for task ID ${taskId}`
          );
        }

        return tasks;
      }
      return undefined;
    } catch (error) {
      this.log('Error in getOverlordChildren: ' + error); // Log error message
      this.handleError(error);
      throw error;
    }
  }

  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      return await this.authService.getCurrentUserId();
    } catch (error) {
      this.handleError(error);
      throw new Error('Not logged in');
    }
  }

  private handleError(error: unknown): void {
    this.error(error);
    this.popup('An error occurred. Please try again.');
  }
}
