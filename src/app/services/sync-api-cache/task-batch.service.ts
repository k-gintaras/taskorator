import { Injectable } from '@angular/core';
import { UiTask, TaskoratorTask } from '../../models/taskModelManager';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskTransmutationService } from '../tasks/task-transmutation.service';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../tasks/task-action-tracker.service';
import { ErrorService } from '../core/error.service';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskBatchService {
  apiService: ApiStrategy | null = null;

  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    console.log('TaskService initialized with API strategy');
  }

  private ensureApiService(): ApiStrategy {
    if (!this.apiService) {
      throw new Error('API service is not initialized.');
    }
    return this.apiService;
  }

  constructor(
    private taskIdCache: TaskIdCacheService,
    private eventBusService: EventBusService,
    private transmutatorService: TaskTransmutationService,
    private taskActionService: TaskActionTrackerService,
    private errorService: ErrorService
  ) {}

  /**
   * Create a batch of tasks, update the cache, and cache their IDs.
   */
  async createTaskBatch(
    tasks: TaskoratorTask[],
    overlordId: string
  ): Promise<UiTask[] | null> {
    try {
      // if (!this.validatorService.isTaskValid(task)) {
      //   throw new Error('Invalid task, probably because it is empty');
      // }

      // Create tasks via API
      const createdTasks: TaskoratorTask[] | null =
        await this.ensureApiService().createTasks(tasks);
      if (!createdTasks) {
        console.warn('No tasks were created.');
        return null;
      }

      // Convert and cache created tasks
      const extendedTasks = this.transmutatorService.toUiTasks(createdTasks);

      const groupName = 'overlord_' + overlordId;
      this.taskIdCache.addTasksWithGroup(extendedTasks, groupName); // Notify TaskIdCache of addition
      const ids = this.transmutatorService.getIds(extendedTasks);

      // Notify other services
      this.eventBusService.createTasks(extendedTasks);
      this.taskActionService.recordBatchAction(ids, TaskActions.CREATED);
      this.errorService.feedback(
        'Batch ' +
          TaskActions.CREATED +
          ' ' +
          createdTasks.map((t) => t.name).join(',')
      );

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
    tasks: TaskoratorTask[],
    action: TaskActions,
    subAction?: any
  ): Promise<void> {
    try {
      // if (!this.validatorService.isTaskValid(task)) {
      //   throw new Error('Invalid task, probably because it is empty');
      // }

      // Update tasks via API
      await this.ensureApiService().updateTasks(tasks);

      // Refresh cache with updated tasks
      const extendedTasks = this.transmutatorService.toUiTasks(tasks);

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
      this.eventBusService.updateTasks(extendedTasks);
      this.taskActionService.recordBatchAction(ids, action, subAction);
    } catch (error) {
      console.error('Failed to update task batch:', error);
      throw error;
    }
  }
}
