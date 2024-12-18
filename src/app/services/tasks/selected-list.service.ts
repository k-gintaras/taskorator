import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskListKey } from '../../models/task-list-model';

@Injectable({
  providedIn: 'root',
})
export class SelectedListService {
  private selectedListKeySubject = new BehaviorSubject<TaskListKey | null>(
    null
  );
  selectedListKey$ = this.selectedListKeySubject.asObservable();

  /**
   * Get the currently selected list key.
   */
  getSelectedListKey(): TaskListKey | null {
    return this.selectedListKeySubject.value;
  }

  /**
   * Set the currently selected list key.
   * @param listKey - The key of the task list to select.
   */
  setSelectedListKey(listKey: TaskListKey): void {
    this.selectedListKeySubject.next(listKey);
  }

  /**
   * Clear the selected list key.
   */
  clearSelectedListKey(): void {
    this.selectedListKeySubject.next(null);
  }
}
