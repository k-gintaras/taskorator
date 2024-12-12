import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { TaskViewService } from './task-view.service';
import { TaskTransmutationService } from './task-transmutation.service';
import { TaskListKey, TaskListService } from './task-list.service';
import {
  ExtendedTask,
  ROOT_TASK_ID,
  Task,
} from '../../models/taskModelManager';
import { SelectedOverlordService } from '../task/selected-overlord.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorUltraService {
  private originalTaskIds: string[] | null = null; // Store the original list of task IDs
  private originalListGroup: string | null = null; // Store the original list group name

  constructor(
    private taskListService: TaskListService,
    private transmutationService: TaskTransmutationService,
    private viewService: TaskViewService,
    private taskService: TaskService,
    private selectedOverlord: SelectedOverlordService
  ) {}

  /**
   * Load and initialize tasks, then update the view.
   */
  async loadAndInitializeTasks(
    tasks: Task[],
    originalListGroup: string
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
  async previous(task: ExtendedTask): Promise<ExtendedTask[] | null> {
    try {
      if (!task.overlord) {
        console.error('No overlord found for the task.');
        return null;
      }

      const superOverlord = await this.taskService.getSuperOverlord(
        task.overlord
      );
      if (!superOverlord || !superOverlord.overlord) return null;

      const overlordTasks = await this.taskListService.getOverlordTasks(
        superOverlord.overlord
      );
      this.selectedOverlord.setSelectedOverlord(superOverlord.overlord);

      if (overlordTasks)
        this.updateView(TaskListKey.OVERLORD + superOverlord.overlord);
      return overlordTasks;
    } catch (error) {
      console.error('Failed to fetch previous tasks:', error);
      throw error;
    }
  }

  /**
   * Fetch and display the next set of tasks for a given task.
   */
  async next(task: ExtendedTask): Promise<ExtendedTask[] | null> {
    try {
      const overlordTasks = await this.taskListService.getOverlordTasks(
        task.taskId
      );
      this.selectedOverlord.setSelectedOverlord(task.taskId);

      this.updateView(TaskListKey.OVERLORD + task.taskId);
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
    try {
      if (this.originalTaskIds && this.originalListGroup) {
        const tasks = await this.taskListService.getTasks(this.originalTaskIds);
        if (!tasks) return null;

        this.updateView(this.originalListGroup);
        return this.transmutationService.toExtendedTasks(tasks);
      } else {
        const rootTasks = await this.taskListService.getOverlordTasks(
          ROOT_TASK_ID
        );
        if (rootTasks) this.updateView(TaskListKey.OVERLORD + ROOT_TASK_ID);
        return rootTasks;
      }
    } catch (error) {
      console.error('Failed to navigate back to start:', error);
      throw error;
    }
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

      if (tasks) this.updateView(TaskListKey.OVERLORD + superOverlord.overlord);
      return tasks;
    } catch (error) {
      console.error('Failed to navigate to previous overlord:', error);
      throw error;
    }
  }

  /**
   * Notify the TaskViewService to update the view with the current task list group.
   */
  private updateView(taskListGroup: string): void {
    this.viewService.setTasksListGroup(taskListGroup);
  }
}
