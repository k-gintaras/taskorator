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
import { TaskUiDecoratorService } from '../task-list/task-ui-decorator.service';

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
    private taskUiDecorator: TaskUiDecoratorService,
    private errorService: ErrorService
  ) {}

  async navigateInToTask(taskId: string): Promise<void> {
    // Navigate immediately for better UX
    await this.navigateToTaskRoute(taskId);
    
    // Load task data in background and update state
    this.loadTaskAndUpdateState(taskId, 'in');
  }

  async navigateOutOfTask(taskId: string): Promise<void> {
    // Navigate immediately for better UX
    await this.navigateToTaskRoute(taskId);
    
    // Load task data in background and update state
    this.loadTaskAndUpdateState(taskId, 'out');
  }

  async navigateToTaskParent(taskId: string): Promise<void> {
    try {
      const superOverlord = await this.taskService.getSuperOverlord(taskId);
      if (superOverlord?.overlord) {
        this.taskPathService.pop();
        await this.navigateOutOfTask(superOverlord.overlord);
      } else {
        await this.navigateToStart();
      }
    } catch {
      await this.navigateToStart();
    }
  }

  async navigateUp(): Promise<void> {
    const parentTaskId =
      this.selectedOverlordService.getSelectedOverlord()?.taskId ||
      ROOT_TASK_ID;
    await this.navigateToTaskParent(parentTaskId);
  }

  navigateToList(taskListKey: TaskListKey): void {
    const url = this.taskListRouter.getRouteUrl(taskListKey);
    this.router.navigate([url]);
  }

  navigateToRoot(): void {
    this.router.navigate([`/sentinel/tasks/${ROOT_TASK_ID}`]);
  }

  navigateToStart(): void {
    this.taskPathService.clear();

    const context = this.taskListRouter.extractContextFromUrl(this.router.url);
    if (context.listContext) {
      this.router.navigate([`/sentinel/${context.listContext}`]);
    } else {
      this.navigateToRoot();
    }
  }

  private async navigateToTaskRoute(taskId: string): Promise<void> {
    this.taskUiDecorator.markTaskViewed(taskId);
    this.taskUsageService.incrementTaskView(taskId);

    const context = this.taskListRouter.extractContextFromUrl(this.router.url);
    const route = context.listContext
      ? `/sentinel/${context.listContext}/tasks/${taskId}`
      : `/tasks/${taskId}`;

    await this.router.navigate([route]);
  }

  private async loadTaskOrWarn(taskId: string) {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) {
      this.errorService.error(`Task with ID ${taskId} not found.`);
    }
    return task;
  }

  private async loadTaskAndUpdateState(taskId: string, direction: 'in' | 'out'): Promise<void> {
    try {
      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        this.errorService.error(`Task with ID ${taskId} not found.`);
        return;
      }

      // Update state after task is loaded
      this.selectedOverlordService.setSelectedOverlord(task);
      
      if (direction === 'in') {
        this.taskPathService.push({ id: task.taskId, name: task.name });
      } else if (direction === 'out') {
        this.taskPathService.removePath(taskId);
        this.taskPathService.push({ id: task.taskId, name: task.name });
      }
    } catch (error) {
      this.errorService.error(`Failed to load task: ${error}`);
    }
  }
}
