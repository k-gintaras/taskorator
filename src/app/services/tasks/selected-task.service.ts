import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../../models/taskModelManager';
/**
 * @fix @deprecated use SelectedMultipleService and just get last selected task or not?
 */
@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  private selectedTask: Task | null = null;
  private selectedTaskSubject: BehaviorSubject<Task | null> =
    new BehaviorSubject<Task | null>(null);
  selectedTaskObservable: Observable<Task | null> =
    this.selectedTaskSubject.asObservable();

  setSelectedTask(task: Task) {
    this.selectedTask = task;
    this.selectedTaskSubject.next(task);
  }

  getSelectedTask(): Task | null {
    return this.selectedTask;
  }
}
