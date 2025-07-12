import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../sync-api-cache/task.service';
import { TaskListRouterService } from './task-list-router.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskListKey } from '../../../models/task-list-model';
import { SelectedOverlordService } from '../selected/selected-overlord.service';
import { ROOT_TASK_ID } from '../../../models/taskModelManager';
import { TaskPathService } from './task-path.service';
import { ErrorService } from '../../core/error.service';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorService {
  constructor(
    private router: Router,
    private taskService: TaskService,
    private taskListRouter: TaskListRouterService,
    private taskUsageService: TaskUsageService,
    private selectedOverlordService: SelectedOverlordService,
    private taskPathService: TaskPathService,
    private errorService: ErrorService
  ) {}

  async navigateInToTask(taskId: string): Promise<void> {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      this.errorService.error(`Task with ID ${taskId} not found.`);
      return;
    }
    this.selectedOverlordService.setSelectedOverlord(task);
    this.taskPathService.push({ id: task.taskId, name: task.name });
    this.taskUsageService.incrementTaskView(task.taskId);

    await this.navigateToTaskRoute(taskId);
  }

  async navigateOutOfTask(taskId: string): Promise<void> {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      this.errorService.error(`Task with ID ${taskId} not found.`);
      return;
    }
    this.selectedOverlordService.setSelectedOverlord(task);
    this.taskPathService.removePath(task.taskId);
    this.taskUsageService.incrementTaskView(task.taskId);

    await this.navigateToTaskRoute(taskId);
  }

  private async navigateToTaskRoute(taskId: string) {
    const context = this.taskListRouter.extractContextFromUrl(this.router.url);
    const route = context.listContext
      ? `/sentinel/${context.listContext}/tasks/${taskId}`
      : `/tasks/${taskId}`;
    await this.router.navigate([route]);
  }

  async navigateToTaskParent(taskId: string): Promise<void> {
    try {
      const superOverlord = await this.taskService.getSuperOverlord(taskId);
      if (superOverlord?.overlord) {
        await this.navigateOutOfTask(superOverlord.overlord);
      } else {
        //this.taskPathService.clear();
        await this.navigateToStart();
      }
    } catch {
      // this.taskPathService.clear();
      await this.navigateToStart();
    }
  }

  /**
   * Will attempt to navigate to original list, like Daily, Weekly, etc.
   */
  navigateToStart(): void {
    const context = this.taskListRouter.extractContextFromUrl(this.router.url);
    if (context.listContext) {
      this.router.navigate([`/sentinel/${context.listContext}`]);
    } else {
      this.navigateToRoot();
    }
  }

  /**
   * Will navigate to the parent task of the currently selected overlord.
   */
  async navigateUp(): Promise<void> {
    const parentTaskId =
      this.selectedOverlordService.getSelectedOverlord()?.taskId ||
      ROOT_TASK_ID;
    await this.navigateToTaskParent(parentTaskId);
  }

  /**
   * Will navigate to list like daily, weekly or even task id if given OVERLORD type and id subtype
   */
  navigateToList(taskListKey: TaskListKey): void {
    const url = this.taskListRouter.getRouteUrl(taskListKey);
    this.router.navigate([url]);
  }

  navigateToRoot(): void {
    this.router.navigate([`/sentinel/tasks/${ROOT_TASK_ID}`]);
  }
}
