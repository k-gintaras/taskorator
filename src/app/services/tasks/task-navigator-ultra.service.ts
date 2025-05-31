import { Injectable } from '@angular/core';
import { TaskService } from '../sync-api-cache/task.service';
import { TaskViewService } from './task-view.service';
import {
  ExtendedTask,
  ROOT_TASK_ID,
  Task,
} from '../../models/taskModelManager';
import { SelectedOverlordService } from './selected-overlord.service';
import { TaskListKey, TaskListType } from '../../models/task-list-model';
import { TaskUsageService } from './task-usage.service';
import { TaskListService } from '../sync-api-cache/task-list.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorUltraService {
  private originalListGroup: TaskListKey | null = null; // Store the original list group name

  constructor(
    private taskListService: TaskListService,
    private viewService: TaskViewService,
    private taskService: TaskService,
    private selectedOverlord: SelectedOverlordService,
    private taskUsageService: TaskUsageService
  ) {}

  /**
   * Load and initialize tasks, then update the view.
   */
  async loadAndInitializeTasks(originalListGroup: TaskListKey): Promise<void> {
    try {
      this.selectedOverlord.setSelectedOverlord(ROOT_TASK_ID);
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
