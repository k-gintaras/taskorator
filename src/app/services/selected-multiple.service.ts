import { Injectable } from '@angular/core';
import { Task } from '../task-model/taskModelManager';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedMultipleService {
  private selectedTasks = new Set<Task>();

  // A Subject to emit whenever tasks are selected or deselected
  private selectedTasksUpdated = new BehaviorSubject<Task[]>([]);

  /**
   * Add a task to the selected set and notify subscribers
   * @param task Task to add
   */
  addSelectedTask(task: Task): void {
    this.selectedTasks.add(task);
    this.selectedTasksUpdated.next(Array.from(this.selectedTasks));
  }

  /**
   * Remove a task from the selected set and notify subscribers
   * @param task Task to remove
   */
  removeSelectedTask(task: Task): void {
    this.selectedTasks.delete(task);
    this.selectedTasksUpdated.next(Array.from(this.selectedTasks));
  }

  /**
   * Get an observable for clients to subscribe to selected task updates
   * @returns Observable<Set<Task>> of selected tasks
   */
  getSelectedTasks(): Observable<Task[]> {
    return this.selectedTasksUpdated.asObservable();
  }
}
