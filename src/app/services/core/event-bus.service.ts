import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Task } from 'src/app/models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  // eslint-disable-next-line @typescript-eslint/ban-types
  private listeners = new Map<string, Function[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subjects = new Map<string, Subject<any>>();

  constructor() {
    // Initialize all event subjects
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events.forEach((event) => this.subjects.set(event, new Subject<any>()));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, payload: any): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
    this.subjects.get(event)?.next(payload);
  }

  // Listen to events - traditional way
  // eslint-disable-next-line @typescript-eslint/ban-types
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  // Observable way to listen to events
  onEvent<T>(event: string): Observable<T> {
    return this.subjects.get(event)?.asObservable() ?? new Observable();
  }

  // Task-related operations
  createTask(task: Task): void {
    this.emit('createTask', task);
  }

  updateTask(task: Task): void {
    this.emit('updateTask', task);
  }

  getTaskById(taskId: string): void {
    this.emit('getTaskById', taskId);
  }

  getLatestTaskId(): void {
    this.emit('getLatestTaskId', null);
  }

  getSuperOverlord(taskId: string): void {
    this.emit('getSuperOverlord', taskId);
  }

  getOverlordChildren(taskId: string): void {
    this.emit('getOverlordChildren', taskId);
  }

  getTasks(userId: string): void {
    this.emit('getTasks', userId);
  }

  createTasks(tasks: Task[]): void {
    this.emit('createTasks', tasks);
  }

  updateTasks(tasks: Task[]): void {
    this.emit('updateTasks', tasks);
  }
}
