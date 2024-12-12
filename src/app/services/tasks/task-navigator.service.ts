import { Injectable } from '@angular/core';
import {
  ExtendedTask,
  getBaseTask,
  ROOT_TASK_ID,
  Task,
} from '../../models/taskModelManager';
import { TaskService } from './task.service';
import { TaskListService } from './task-list.service';
import { TaskTransmutationService } from './task-transmutation.service';
import { TaskViewService } from './task-view.service';

/**
 * it simply lets us have next tasks and forward tasks based on task passed
 */
@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorService {
  private originalTaskIds: string[] | null = null; // Store the original list of task IDs

  constructor(
    private taskListService: TaskListService,
    private transmutationService: TaskTransmutationService,
    private viewService: TaskViewService,
    private taskService: TaskService
  ) {}

  initialize(taskIds: string[]): void {
    this.originalTaskIds = taskIds;
  }

  async previous(task: ExtendedTask): Promise<ExtendedTask[] | null> {
    if (!task.overlord) {
      console.error('No overlord found for the task.');
      return null;
    }

    const superOverlord = await this.taskService.getSuperOverlord(
      task.overlord
    );
    if (!superOverlord) return null;
    return await this.taskListService.getOverlordTasks(superOverlord.taskId);
  }

  async next(task: ExtendedTask): Promise<ExtendedTask[] | null> {
    return await this.taskListService.getOverlordTasks(task.taskId);
  }

  /**
   * Navigate back to the original task list or to the root task if the original list is unavailable.
   */
  async backToStart(): Promise<ExtendedTask[] | null> {
    if (this.originalTaskIds) {
      const tasks = this.taskListService.getTasks(this.originalTaskIds);
      return Promise.resolve(tasks);
    } else {
      // Fallback to the root task's children
      return await this.taskListService.getOverlordTasks(ROOT_TASK_ID);
    }
  }
}
