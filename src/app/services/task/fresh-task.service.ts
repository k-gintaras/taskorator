import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { EventBusService } from '../core/event-bus.service';
import { Task } from '../../models/taskModelManager';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class FreshTaskService {
  private freshTasks = new Map<string, boolean>();
  private freshTaskSubject = new BehaviorSubject<Map<string, boolean>>(
    this.freshTasks
  );

  constructor(private eventBusService: EventBusService) {
    this.eventBusService.onEvent<Task>('createTask').subscribe((task) => {
      this.handleFreshTask(task);
    });

    this.eventBusService.onEvent<Task>('updateTask').subscribe((task) => {
      this.handleFreshTask(task);
    });
  }

  private handleFreshTask(task: Task) {
    this.freshTasks.set(task.taskId, true);
    this.freshTaskSubject.next(this.freshTasks);

    setTimeout(() => {
      this.freshTasks.set(task.taskId, false);
      this.freshTaskSubject.next(this.freshTasks);
    }, 3500); // Duration to highlight the task
  }

  getFreshTasks(): Observable<Map<string, boolean>> {
    return this.freshTaskSubject.asObservable();
  }
}
