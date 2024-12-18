import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { TaskViewService } from './task-view.service';
import { TaskTransmutationService } from './task-transmutation.service';
import { TaskListService } from './task-list.service';
import {
  ExtendedTask,
  ROOT_TASK_ID,
  Task,
} from '../../models/taskModelManager';
import { SelectedOverlordService } from '../task/selected-overlord.service';
import { TaskListKey, TaskListType } from '../../models/task-list-model';
import { TaskUsageService } from './task-usage.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorUltraService {
  private originalTaskIds: string[] | null = null; // Store the original list of task IDs
  private originalListGroup: TaskListKey | null = null; // Store the original list group name

  constructor(
    private taskListService: TaskListService,
    private transmutationService: TaskTransmutationService,
    private viewService: TaskViewService,
    private taskService: TaskService,
    private selectedOverlord: SelectedOverlordService,
    private taskUsageService: TaskUsageService
  ) {}

  /**
   * Load and initialize tasks, then update the view.
   */
  async loadAndInitializeTasks(
    tasks: Task[],
    originalListGroup: TaskListKey
  ): Promise<void> {
    try {
      this.selectedOverlord.setSelectedOverlord(ROOT_TASK_ID);
      const extendedTasks = this.transmutationService.toExtendedTasks(tasks);
      this.originalTaskIds = this.transmutationService.getIds(extendedTasks);
      this.originalListGroup = originalListGroup;

      this.updateView(originalListGroup);
    } catch (error) {
      console.error('Failed to load and initialize tasks:', error);
      throw error;
    }
  }

  /**
   * Fetch and display the previous set of tasks for a given task.
   */
  async previous(taskOverlordId: string): Promise<ExtendedTask[] | null> {
    try {
      if (!taskOverlordId) {
        console.error('No overlord found for the task.');
        return null;
      }

      const superOverlord = await this.taskService.getSuperOverlord(
        taskOverlordId
      );
      if (!superOverlord || !superOverlord.overlord) return null;

      const overlordTasks = await this.taskListService.getOverlordTasks(
        superOverlord.overlord
      );
      this.selectedOverlord.setSelectedOverlord(superOverlord.overlord);

      if (overlordTasks) {
        const taskListKey: TaskListKey = {
          type: TaskListType.OVERLORD,
          data: superOverlord.overlord,
        };
        // TaskListKey.OVERLORD + superOverlord.overlord;
        this.updateView(taskListKey);
        this.taskUsageService.incrementTaskView(superOverlord.overlord);
      }
      return overlordTasks;
    } catch (error) {
      console.error('Failed to fetch previous tasks:', error);
      throw error;
    }
  }

  /**
   * Fetch and display the next set of tasks for a given task.
   */
  async next(taskId: string): Promise<ExtendedTask[] | null> {
    try {
      const overlordTasks = await this.taskListService.getOverlordTasks(taskId);
      this.selectedOverlord.setSelectedOverlord(taskId);

      const taskListKey: TaskListKey = {
        type: TaskListType.OVERLORD,
        data: taskId,
      };

      this.updateView(taskListKey);
      this.taskUsageService.incrementTaskView(taskId);

      return overlordTasks;
    } catch (error) {
      console.error('Failed to fetch next tasks:', error);
      throw error;
    }
  }

  /**
   * Navigate back to the original task list or to the root task if unavailable.
   */
  async backToStart(): Promise<ExtendedTask[] | null> {
    // try {
    //   if (this.originalTaskIds && this.originalListGroup) {
    //     const tasks = await this.taskListService.getTasks(this.originalTaskIds);
    //     if (!tasks) return null;

    //     this.updateView(this.originalListGroup);
    //     return this.transmutationService.toExtendedTasks(tasks);
    //   } else {
    //     const rootTasks = await this.taskListService.getOverlordTasks(
    //       ROOT_TASK_ID
    //     );
    //     if (rootTasks) {
    //       const taskListKey: TaskListKey = {
    //         type: TaskListType.OVERLORD,
    //         data: ROOT_TASK_ID,
    //       };
    //       this.updateView(taskListKey);
    //     }

    //     return rootTasks;
    //   }
    // } catch (error) {
    //   console.error('Failed to navigate back to start:', error);
    //   throw error;
    // }
    if (!this.originalListGroup) return null;
    this.viewService.setTasksListGroup(this.originalListGroup);
    // in case we go back and selected overlord is last clicked task... going home just resets to root
    this.selectedOverlord.setSelectedOverlord(ROOT_TASK_ID);
    return null;
  }

  /**
   * Navigate back to the previous overlord (super overlord).
   */
  async backToPrevious(): Promise<ExtendedTask[] | null> {
    try {
      const currentOverlordId = this.selectedOverlord.getSelectedOverlord();
      if (!currentOverlordId) {
        console.error('No current overlord found.');
        return null;
      }

      const superOverlord = await this.taskService.getSuperOverlord(
        currentOverlordId
      );
      if (!superOverlord || !superOverlord.overlord) {
        console.error('No super overlord found.');
        return null;
      }

      const tasks = await this.taskListService.getOverlordTasks(
        superOverlord.overlord
      );
      this.selectedOverlord.setSelectedOverlord(superOverlord.overlord);

      if (tasks) {
        const taskListKey: TaskListKey = {
          type: TaskListType.OVERLORD,
          data: superOverlord.overlord,
        };
        this.updateView(taskListKey);
      }
      return tasks;
    } catch (error) {
      console.error('Failed to navigate to previous overlord:', error);
      throw error;
    }
  }

  /**
   * Notify the TaskViewService to update the view with the current task list group.
   */
  private updateView(taskListGroup: TaskListKey): void {
    this.viewService.setTasksListGroup(taskListGroup);
  }
}
