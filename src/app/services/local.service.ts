import { Injectable } from '@angular/core';
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { Task } from '../task-model/taskModelManager';
import { TaskTree } from 'src/task-tree';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  private tasks: Task[] = [];
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>(
    []
  );

  private taskTree: TaskTree = new TaskTree();

  constructor() {}

  getAllTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTaskTree(): TaskTree {
    return this.taskTree;
  }

  updateTasks(tasks: Task[]): Observable<void> {
    // Update the local tasks array with the server tasks
    this.tasks = tasks;
    this.tasksSubject.next(this.tasks); // Notify components about the updated tasks
    this.taskTree.buildTree(this.tasks);

    return of(undefined); // Return an observable of void since there is no asynchronous operation here
  }

  deleteTask(taskId: number): Observable<any> {
    console.log('Deleted' + taskId);
    const index = this.tasks.findIndex((t) => t.taskId === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.tasksSubject.next(this.tasks); // Notify components about the updated tasks
    }
    return of(null);
  }

  createTask(task: Task): Observable<Task> {
    this.tasks.push(task);
    this.tasksSubject.next(this.tasks);
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    const existingTask = this.tasks.find((t) => t.taskId === task.taskId);
    if (existingTask) {
      Object.assign(existingTask, task);
      this.tasksSubject.next(this.tasks);
    }
    return of(task);
  }
}
