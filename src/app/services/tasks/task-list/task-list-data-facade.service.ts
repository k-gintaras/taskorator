import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { TaskNavigatorDataService } from '../task-navigation/task-navigator-data.service';
import { TaskUiInteractionService } from './task-ui-interaction.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListDataFacadeService {
  constructor(
    private navigatorData: TaskNavigatorDataService,
    private interactionService: TaskUiInteractionService
  ) {}

  async loadTaskList(taskListKey: TaskListKey): Promise<void> {
    await this.navigatorData.setTasksByKey(taskListKey);
  }

  get currentTasks$() {
    return this.navigatorData.currentTasks$;
  }

  get currentListKey$() {
    return this.navigatorData.currentListKey$;
  }

  redecorateCurrentTasks(): void {
    this.navigatorData.redecorateCurrentTasks();
  }

  refreshCurrentTasks(): void {
    this.navigatorData.refreshCurrentTasks();
  }

  markTaskViewed(taskId: string): void {
    this.interactionService.markViewed(taskId);
    this.redecorateCurrentTasks();
  }

  selectTask(taskId: string): void {
    this.interactionService.select(taskId);
    this.redecorateCurrentTasks();
  }

  toggleTaskSelection(taskId: string): void {
    this.interactionService.toggleSelection(taskId);
    this.redecorateCurrentTasks();
  }

  unselectTask(taskId: string): void {
    this.interactionService.unselect(taskId);
    this.redecorateCurrentTasks();
  }

  clearSelected(): void {
    this.interactionService.clearSelection();
    this.redecorateCurrentTasks();
  }

  getSelectedTaskIds(): string[] {
    return this.interactionService.getSelectedTaskIds();
  }
}
