import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UiTask, TaskoratorTask } from '../../models/taskModelManager';
import { TaskListKey } from '../../models/task-list-model';

/**
 * must pass task object or else task tree will not be able to add tasks with names...
 */
@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private listeners = new Map<string, Function[]>();
  private subjects = new Map<string, Subject<any>>();

  constructor() {
    const events = [
      'createTask',
      'updateTask',
      'getTaskById',
      'getLatestTaskId',
      'getSuperOverlord',
      'getOverlordChildren',
      'getTasks',
      'createTasks',
      'updateTasks',
    ];
    events.forEach((event) => this.subjects.set(event, new Subject<any>()));
  }

  emit(event: string, payload: any): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
    this.subjects.get(event)?.next(payload);
  }

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  onEvent<T>(event: string): Observable<T> {
    return this.subjects.get(event)?.asObservable() ?? new Observable();
  }

  getTaskById(taskId: UiTask): void {
    this.emit('getTaskById', taskId);
  }

  getLatestTaskId(taskId: UiTask): void {
    this.emit('getLatestTaskId', taskId);
  }

  getSuperOverlord(taskId: UiTask): void {
    this.emit('getSuperOverlord', taskId);
  }

  getOverlordChildren(taskIds: UiTask[]): void {
    this.emit('getOverlordChildren', taskIds);
  }

  getTasks(tasks: UiTask[], taskListKey: TaskListKey): void {
    const tasksObject = { tasks, taskListKey };
    this.emit('getTasks', tasksObject);
  }

  // Emit just IDs or arrays of IDs instead of full objects
  createTask(taskId: UiTask): void {
    this.emit('createTask', taskId);
  }

  updateTask(taskId: UiTask): void {
    this.emit('updateTask', taskId);
  }

  createTasks(taskIds: UiTask[]): void {
    this.emit('createTasks', taskIds);
  }

  updateTasks(taskIds: UiTask[]): void {
    this.emit('updateTasks', taskIds);
  }
}
