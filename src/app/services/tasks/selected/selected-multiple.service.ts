import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskoratorTask } from '../../../models/taskModelManager';

/**
 * @deprecated use task-ui-interaction-service
 */
@Injectable({
  providedIn: 'root',
})
export class SelectedMultipleService {
  // private selectedTasks = new Set<TaskoratorTask>();
  // // A Subject to emit whenever tasks are selected or deselected
  // private selectedTasksUpdated = new BehaviorSubject<TaskoratorTask[]>([]);
  // /**
  //  * Add a task to the selected set and notify subscribers
  //  * @param task Task to add
  //  */
  // addSelectedTask(task: TaskoratorTask): void {
  //   this.selectedTasks.add(task);
  //   this.selectedTasksUpdated.next(Array.from(this.selectedTasks));
  // }
  // clear() {
  //   this.selectedTasks.clear();
  //   this.selectedTasksUpdated.next([]);
  // }
  // addRemoveSelectedTask(task: TaskoratorTask): boolean {
  //   let selected = false;
  //   if (this.selectedTasks.has(task)) {
  //     // If the task is already in the set, remove it
  //     this.selectedTasks.delete(task);
  //   } else {
  //     // If the task is not in the set, add it
  //     this.selectedTasks.add(task);
  //     selected = true;
  //   }
  //   // Emit the updated list of tasks
  //   this.selectedTasksUpdated.next(Array.from(this.selectedTasks));
  //   return selected;
  // }
  // isSelected(task: TaskoratorTask): boolean {
  //   return this.selectedTasks.has(task);
  // }
  // /**
  //  * Remove a task from the selected set and notify subscribers
  //  * @param task Task to remove
  //  */
  // removeSelectedTask(task: TaskoratorTask): void {
  //   this.selectedTasks.delete(task);
  //   this.selectedTasksUpdated.next(Array.from(this.selectedTasks));
  // }
  // /**
  //  * Get an observable for clients to subscribe to selected task updates
  //  * @returns Observable<Set<Task>> of selected tasks
  //  */
  // getSelectedTasks(): Observable<TaskoratorTask[]> {
  //   return this.selectedTasksUpdated.asObservable();
  // }
}
