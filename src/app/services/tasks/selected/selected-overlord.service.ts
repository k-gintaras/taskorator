import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import { TaskService } from '../../sync-api-cache/task.service';
import { ROOT_TASK_ID } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class SelectedOverlordService {
  private selectedOverlord = new BehaviorSubject<UiTask | null>(null);
  private initialized = false;

  constructor(private taskService: TaskService) {
    // Initialize with root task on service creation
    this.initializeDefaultOverlord();
  }

  private async initializeDefaultOverlord(): Promise<void> {
    if (this.initialized) return;

    try {
      const rootTask = await this.taskService.getTaskById(ROOT_TASK_ID);
      this.selectedOverlord.next(rootTask);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize root overlord:', error);
    }
  }

  getSelectedOverlordObservable(): Observable<UiTask | null> {
    return this.selectedOverlord.asObservable();
  }

  getSelectedOverlord(): UiTask | null {
    return this.selectedOverlord.value;
  }

  getSelectedOverlordId(): string | null {
    return this.selectedOverlord.value?.taskId || null;
  }

  // Set by full task object
  setSelectedOverlord(task: UiTask | null) {
    this.selectedOverlord.next(task);
  }

  // Set by ID - loads and caches the full task
  async setSelectedOverlordById(taskId: string | null): Promise<void> {
    // If null provided, default to root task
    const targetTaskId = taskId || ROOT_TASK_ID;

    // Check if we already have this task loaded
    const current = this.selectedOverlord.value;
    if (current?.taskId === targetTaskId) {
      return; // Already loaded, no need to fetch
    }

    try {
      const task = await this.taskService.getTaskById(targetTaskId);
      this.selectedOverlord.next(task);
    } catch (error) {
      console.error('Failed to load selected overlord:', error);
      // Fallback to root task if loading fails
      try {
        const rootTask = await this.taskService.getTaskById(ROOT_TASK_ID);
        this.selectedOverlord.next(rootTask);
      } catch (fallbackError) {
        console.error('Failed to load root overlord as fallback:', fallbackError);
        this.selectedOverlord.next(null);
      }
    }
  }

  // Clear selection
  clear(): void {
    this.selectedOverlord.next(null);
  }

  // Check if a task is currently selected
  isSelected(taskId: string): boolean {
    return this.selectedOverlord.value?.taskId === taskId;
  }
}
