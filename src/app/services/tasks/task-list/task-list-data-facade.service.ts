import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { UiTask } from '../../../models/taskModelManager';
import { TaskNavigatorDataService } from '../task-navigation/task-navigator-data.service';
import { TaskUiInteractionService } from './task-ui-interaction.service';
import { TaskListOrganizationService, SortMode } from './task-list-organization.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListDataFacadeService {
  constructor(
    private navigatorData: TaskNavigatorDataService,
    private interactionService: TaskUiInteractionService,
    private organizationService: TaskListOrganizationService
  ) {}

  // --- Load & Stream Management ---
  async loadTaskList(taskListKey: TaskListKey): Promise<void> {
    await this.navigatorData.setTasksByKey(taskListKey);
    this.organizationService.setCurrentListKey(taskListKey);
  }

  async setTasks(tasks: UiTask[]): Promise<void> {
    await this.navigatorData.setTasks(tasks);
    this.organizationService.setCurrentListKey(null); // Custom list
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

  // --- Selection & View Methods ---
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

  // --- Sorting Methods ---
  /**
   * Sort current tasks by 'date', 'priority', or 'rules'.
   */
  sortCurrentTasks(order: 'date' | 'priority' | 'rules'): void {
    if (order === 'rules') {
      this.organizationService.resetToDefault();
      this.navigatorData.refreshCurrentTasks(); // Re-apply original rules
    } else {
      this.organizationService.setSortMode(order as SortMode);
      this.navigatorData.sortCurrentTasks(order as 'date' | 'priority');
    }
  }

  /**
   * Get current sort mode from organization service
   */
  getCurrentSortMode(): SortMode {
    return this.organizationService.getCurrentState().sortMode;
  }

  /**
   * Reset sorting to default (rules-based)
   */
  resetSortToDefault(): void {
    this.organizationService.resetToDefault();
    this.navigatorData.refreshCurrentTasks();
  }

  /**
   * Check if current sort is the default rules-based sort
   */
  isDefaultSort(): boolean {
    return this.organizationService.isDefaultSort();
  }

  /**
   * Get available sort modes for current list
   */
  getAvailableSortModes(): SortMode[] {
    const currentKey = this.navigatorData.getCurrentListKey();
    return this.organizationService.getAvailableSortModes(currentKey || undefined);
  }
}
