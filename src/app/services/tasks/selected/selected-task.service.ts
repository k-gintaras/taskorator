import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskoratorTask } from '../../../models/taskModelManager';
/**
 * @fix @deprecated use SelectedMultipleService and just get last selected task or not?
 */
@Injectable({
  providedIn: 'root',
})
export class SelectedTaskService {
  private selectedTask: TaskoratorTask | null = null;
  private selectedTaskSubject: BehaviorSubject<TaskoratorTask | null> =
    new BehaviorSubject<TaskoratorTask | null>(null);
  selectedTaskObservable: Observable<TaskoratorTask | null> =
    this.selectedTaskSubject.asObservable();

  setSelectedTask(task: TaskoratorTask) {
    this.selectedTask = task;
    this.selectedTaskSubject.next(task);
  }

  getSelectedTask(): TaskoratorTask | null {
    return this.selectedTask;
  }
}
