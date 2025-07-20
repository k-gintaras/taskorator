import { Injectable } from '@angular/core';
import {
  TaskActionTrackerService,
  TaskActions,
} from '../task-action-tracker.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskUiDecoratorService } from './task-ui-decorator.service';

@Injectable({
  providedIn: 'root',
})
export class TaskUiInteractionService {
  constructor(
    private taskUiDecorator: TaskUiDecoratorService,
    private taskUsageService: TaskUsageService,
    private taskActionTracker: TaskActionTrackerService
  ) {}

  markViewed(taskId: string): void {
    this.taskUiDecorator.markTaskViewed(taskId);
    this.taskUsageService.incrementTaskView(taskId);
    this.taskActionTracker.recordAction(
      taskId,
      TaskActions.VIEWED,
      undefined,
      'ui'
    );
  }

  select(taskId: string): void {
    this.taskUiDecorator.markTaskSelected(taskId);
    this.taskActionTracker.recordAction(
      taskId,
      TaskActions.SELECTED,
      undefined,
      'ui'
    );
  }

  toggleSelection(taskId: string): void {
    this.taskUiDecorator.toggleTaskSelection(taskId);
    this.taskActionTracker.recordAction(
      taskId,
      TaskActions.TOGGLED_SELECTION,
      undefined,
      'ui'
    );
  }

  unselect(taskId: string): void {
    this.taskUiDecorator.unselectTask(taskId);
    this.taskActionTracker.recordAction(
      taskId,
      TaskActions.UNSELECTED,
      undefined,
      'ui'
    );
  }

  clearSelection(): void {
    this.taskUiDecorator.clearSelected();
    this.taskActionTracker.recordAction(
      'multiple',
      TaskActions.SELECTION_CLEARED,
      undefined,
      'ui'
    );
  }

  getSelectedTaskIds(): string[] {
    return this.taskUiDecorator.getSelectedTaskIds();
  }
}
