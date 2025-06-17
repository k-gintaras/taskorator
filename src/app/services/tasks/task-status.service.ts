import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type TaskUiStatus =
  | 'normal'
  | 'highlighted'
  | 'flagged'
  | 'viewed'
  | 'updated'; // not necessarily UI but for now it will be

@Injectable({ providedIn: 'root' })
export class TaskStatusService {
  private statusMap = new Map<string, TaskUiStatus>();
  private statusSubject = new BehaviorSubject<Map<string, TaskUiStatus>>(
    this.statusMap
  );

  /** Observable of all task statuses (could be optimized to emit only changes) */
  get statuses$(): Observable<Map<string, TaskUiStatus>> {
    return this.statusSubject.asObservable();
  }

  /** Get current status or 'normal' if none */
  getStatus(taskId: string): TaskUiStatus {
    return this.statusMap.get(taskId) || 'normal';
  }

  /** Set status for a task and notify subscribers */
  setStatus(taskId: string, status: TaskUiStatus): void {
    this.statusMap.set(taskId, status);
    this.statusSubject.next(this.statusMap);
  }

  /** Clear status for a task (sets to normal) */
  clearStatus(taskId: string): void {
    this.statusMap.delete(taskId);
    this.statusSubject.next(this.statusMap);
  }

  /** Clear all statuses */
  clearAll(): void {
    this.statusMap.clear();
    this.statusSubject.next(this.statusMap);
  }
}
