import { Injectable } from '@angular/core';
import { ExtendedTask, Task } from '../../models/taskModelManager';
import { TaskApiService } from '../api/task-api.service';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { AuthService } from '../core/auth.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskTransmutationService } from './task-transmutation.service';
import {
  TaskActions,
  TaskActionTrackerService,
} from './task-action-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class TaskBatchService {
  constructor(
    private taskIdCache: TaskIdCacheService,
    private taskApi: TaskApiService,
    private authService: AuthService,
    private eventBusService: EventBusService,
    private transmutatorService: TaskTransmutationService,
    private taskActionService: TaskActionTrackerService
  ) {}

  /**
   * Create a batch of tasks, update the cache, and cache their IDs.
   */
  async createTaskBatch(
    tasks: Task[],
    overlordId: string
  ): Promise<ExtendedTask[] | null> {
    try {
      // if (!this.validatorService.isTaskValid(task)) {
      //   throw new Error('Invalid task, probably because it is empty');
      // }
      const userId = await this.getUserId();
      if (!userId) throw new Error('User not authenticated');

      // Create tasks via API
      const createdTasks: Task[] | null = await this.taskApi.createTasks(
        userId,
        tasks
      );
      if (!createdTasks) {
        console.warn('No tasks were created.');
        return null;
      }

      // Convert and cache created tasks
      const extendedTasks =
        this.transmutatorService.toExtendedTasks(createdTasks);

      const groupName = 'overlord_' + overlordId;
      this.taskIdCache.addTasksWithGroup(extendedTasks, groupName); // Notify TaskIdCache of addition
      const ids = this.transmutatorService.getIds(extendedTasks);

      // Notify other services
      this.eventBusService.createTasks(tasks);
      this.taskActionService.recordBatchAction(ids, TaskActions.CREATED);

      return extendedTasks;
    } catch (error) {
      console.error('Failed to create task batch:', error);
      return null;
    }
  }

  /**
   * Update a batch of tasks, refresh cache, and notify listeners.
   */
  async updateTaskBatch(
    tasks: Task[],
    action: TaskActions,
    subAction?: any
  ): Promise<void> {
    try {
      // if (!this.validatorService.isTaskValid(task)) {
      //   throw new Error('Invalid task, probably because it is empty');
      // }
      const userId = await this.getUserId();
      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      // Update tasks via API
      await this.taskApi.updateTasks(userId, tasks);

      // Refresh cache with updated tasks
      const extendedTasks = this.transmutatorService.toExtendedTasks(tasks);

      // Notify TaskIdCache based on action
      switch (action) {
        case TaskActions.MOVED:
          extendedTasks.forEach((task) => {
            const currentGroup = this.taskIdCache.getTaskGroup(task.taskId);
            if (currentGroup) {
              // THE ISSUE WAS wrong overlord key... but we need to still allow other keys...
              // we assume subAction will be overlord.taskId the new owner of the tasks...
              // what if it is not? well i guess we save it to a list we can never access? somewhere in memory :D
              // do not worry as API will just have tasks with new overlord... and later we can just get them from that overlord
              // if we know which overlord now owns them :D
              // what if we forget? search in a tree?
              this.taskIdCache.moveTask(
                task.taskId,
                currentGroup,
                'overlord_' + subAction || 'default'
              );
            }
          });
          break;
        case TaskActions.DELETED:
          extendedTasks.forEach((task) => {
            const groupName = this.taskIdCache.getTaskGroup(task.taskId);
            if (groupName) {
              this.taskIdCache.deleteTask(task.taskId);
            }
          });
          break;
        case TaskActions.UPDATED:
          this.taskIdCache.updateTasks(extendedTasks); // Just refresh cache with updated tasks
          break;
      }

      const ids = this.transmutatorService.getIds(extendedTasks);

      // Notify other services
      this.eventBusService.updateTasks(tasks);
      this.taskActionService.recordBatchAction(ids, action, subAction);
    } catch (error) {
      console.error('Failed to update task batch:', error);
      throw error;
    }
  }

  /**
   * Retrieve the current user ID (handles authentication checks).
   */
  private async getUserId(): Promise<string> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      return userId;
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      throw error;
    }
  }
}
