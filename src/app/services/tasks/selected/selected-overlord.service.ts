import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import { TaskService } from '../../sync-api-cache/task.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedOverlordService {
  private selectedOverlord = new BehaviorSubject<UiTask | null>(null);

  constructor(private taskService: TaskService) {}

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
    if (!taskId) {
      this.selectedOverlord.next(null);
      return;
    }

    // Check if we already have this task loaded
    const current = this.selectedOverlord.value;
    if (current?.taskId === taskId) {
      return; // Already loaded, no need to fetch
    }

    try {
      const task = await this.taskService.getTaskById(taskId);
      this.selectedOverlord.next(task);
    } catch (error) {
      console.error('Failed to load selected overlord:', error);
      this.selectedOverlord.next(null);
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
