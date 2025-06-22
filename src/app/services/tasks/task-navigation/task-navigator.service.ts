import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../sync-api-cache/task.service';
import { TaskListRouterService } from './task-list-router.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskListKey } from '../../../models/task-list-model';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorService {
  constructor(
    private router: Router,
    private taskService: TaskService,
    private taskListRouter: TaskListRouterService,
    private taskUsageService: TaskUsageService
  ) {}

  /**
   * Navigate into a task (show its children)
   * Uses current URL context to maintain navigation path
   */
  async navigateToTask(taskId: string): Promise<void> {
    const currentUrl = this.router.url;
    const context = this.taskListRouter.extractContextFromUrl(currentUrl);

    // Track task usage
    this.taskUsageService.incrementTaskView(taskId);

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

  /**
   * Navigate to task's parent (go up one level)
   */
  async navigateToParent(taskId: string): Promise<void> {
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

    if (context.listContext) {
      // Go back to the list
      this.router.navigate([`/sentinel/${context.listContext}`]);
    } else {
      // Fallback to browser back or home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.router.navigate(['/sentinel']);
      }
    }
  }

  /**
   * Navigate to a specific task list
   */
  navigateToList(taskListKey: TaskListKey): void {
    const url = this.taskListRouter.getRouteUrl(taskListKey);
    this.router.navigate([url]);
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
