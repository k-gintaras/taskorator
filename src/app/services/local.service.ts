import { Injectable } from '@angular/core';
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  private tasks: Task[] = [];
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>(
    []
  );

  constructor() {}

  deleteTask(taskId: number): Observable<any> {
    console.log('Deleted' + taskId);
    const index = this.tasks.findIndex((t) => t.taskId === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.tasksSubject.next(this.tasks); // Notify components about the updated tasks
    }
    return of(null);
  }

  getAllTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  updateTasks(tasks: Task[]): Observable<void> {
    // Update the local tasks array with the server tasks
    this.tasks = tasks;
    this.tasksSubject.next(this.tasks); // Notify components about the updated tasks

    return of(undefined); // Return an observable of void since there is no asynchronous operation here
  }

  createTask(task: Task): Observable<Task> {
    this.tasks.push(task);
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    const existingTask = this.tasks.find((t) => t.taskId === task.taskId);
    if (existingTask) {
      Object.assign(existingTask, task);
    }
    return of(task);
  }
}
