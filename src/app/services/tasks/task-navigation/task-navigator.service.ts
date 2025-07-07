import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../sync-api-cache/task.service';
import { TaskListRouterService } from './task-list-router.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskListKey } from '../../../models/task-list-model';
import { SelectedOverlordService } from '../selected/selected-overlord.service';
import { ExtendedTask, ROOT_TASK_ID } from '../../../models/taskModelManager';
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

  /**
   * Navigate into a task (show its children)
   * Uses current URL context to maintain navigation path
   */
  async navigateToTask(taskId: string): Promise<void> {
    const currentUrl = this.router.url;
    const context = this.taskListRouter.extractContextFromUrl(currentUrl);
    const task: ExtendedTask | null = await this.taskService.getTaskById(
      taskId
    );

    if (!task) {
      this.errorService.error(`Task with ID ${taskId} not found.`);
      return;
    }

    this.processData(task);

    if (context.listContext) {
      // Stay within the current list context
      this.router.navigate([
        `/sentinel/${context.listContext}/tasks/${taskId}`,
      ]);
    } else {
      // Direct task navigation
      this.router.navigate([`/tasks/${taskId}`]);
    }
  }

  processData(task: ExtendedTask) {
    this.selectedOverlordService.setSelectedOverlord(task);

    // where we are at in tree
    const currentPath = this.taskPathService.getCurrentPath();
    const newPath = [...currentPath, task.name];
    this.taskPathService.setPath(newPath);

    // Track task usage
    this.taskUsageService.incrementTaskView(task.taskId);
  }

  /**
   * Navigate to task's parent (go up one level)
   */
  async navigateToParent(taskId: string): Promise<void> {
    // when we dont know parent, just go to root or just back
    try {
      const superOverlord = await this.taskService.getSuperOverlord(taskId);

      if (superOverlord?.overlord) {
        await this.navigateToTask(superOverlord.overlord);
      } else {
        // No parent found, go back to current list context or home
        this.navigateBack();
      }
    } catch (error) {
      console.error('Failed to navigate to parent:', error);
      this.navigateBack();
    }
  }

  /**
   * Navigate back (browser back or context-aware fallback)
   */
  navigateBack(): void {
    const currentUrl = this.router.url;
    const context = this.taskListRouter.extractContextFromUrl(currentUrl);

    // attempt to go back to list like daily task, otherwise just go to tree root
    if (context.listContext) {
      // Go back to the list
      this.router.navigate([`/sentinel/${context.listContext}`]);
    } else {
      this.navigateToTheBeginning();
    }
  }

  /**
   * Navigate to a specific task list
   */
  navigateToList(taskListKey: TaskListKey): void {
    const url = this.taskListRouter.getRouteUrl(taskListKey);
    this.router.navigate([url]);
  }

  private async navigateToTheBeginning(): Promise<void> {
    this.router.navigate([`/sentinel/tasks/${ROOT_TASK_ID}`]);
  }

  /**
   * Get current navigation context from URL
   */
  getCurrentContext(): { listContext?: string; taskId?: string } {
    return this.taskListRouter.extractContextFromUrl(this.router.url);
  }

  /**
   * Check if we can navigate to parent
   */
  async canNavigateToParent(taskId: string): Promise<boolean> {
    try {
      const superOverlord = await this.taskService.getSuperOverlord(taskId);
      return !!superOverlord?.overlord;
    } catch {
      return false;
    }
  }
}
