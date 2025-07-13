import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type TaskUiStatus =
  | 'normal'
  | 'highlighted'
  | 'flagged'
  | 'viewed'
  | 'updated';

interface TimedStatus {
  status: TaskUiStatus;
  timestamp: number;
  expiresAt?: number; // Optional expiry time
}

@Injectable({ providedIn: 'root' })
export class TaskStatusService {
  private statusMap = new Map<string, TimedStatus>();
  private statusSubject = new BehaviorSubject<Map<string, TaskUiStatus>>(
    new Map()
  );

  // Configurable expiry times (in milliseconds)
  private readonly EXPIRY_TIMES: Partial<Record<TaskUiStatus, number>> = {
    viewed: 5 * 60 * 1000, // 5 minutes
    updated: 30 * 60 * 1000, // 30 minutes
    highlighted: 10 * 60 * 1000, // 10 minutes
    // flagged and normal don't expire (not included)
  };

  constructor() {
    // Clean up expired statuses every minute
    setInterval(() => this.cleanupExpiredStatuses(), 60 * 1000);
  }

  /** Observable of all task statuses (automatically cleaned) */
  get statuses$(): Observable<Map<string, TaskUiStatus>> {
    return this.statusSubject.asObservable();
  }

  /** Get current status or 'normal' if none/expired */
  getStatus(taskId: string): TaskUiStatus {
    const timedStatus = this.statusMap.get(taskId);

    if (!timedStatus) return 'normal';

    // Check if expired
    if (this.isExpired(timedStatus)) {
      this.statusMap.delete(taskId);
      this.emitCurrentStatuses();
      return 'normal';
    }

    return timedStatus.status;
  }

  /** Set status for a task with optional custom expiry */
  setStatus(
    taskId: string,
    status: TaskUiStatus,
    customExpiryMs?: number
  ): void {
    const now = Date.now();
    let expiresAt: number | undefined;
    const expiryTime = this.EXPIRY_TIMES[status];

    if (customExpiryMs) {
      expiresAt = now + customExpiryMs;
    } else if (expiryTime) {
      expiresAt = now + expiryTime;
    }
    // If no expiry time defined (like 'flagged'), it won't expire

    this.statusMap.set(taskId, {
      status,
      timestamp: now,
      expiresAt,
    });

    this.emitCurrentStatuses();
  }

  /** Mark task as viewed (auto-expires in 5 minutes) */
  markAsViewed(taskId: string): void {
    this.setStatus(taskId, 'viewed');
  }

  /** Mark task as recently updated (auto-expires in 30 minutes) */
  markAsUpdated(taskId: string): void {
    this.setStatus(taskId, 'updated');
  }

  /** Check if task was recently viewed (within expiry time) */
  isRecentlyViewed(taskId: string): boolean {
    return this.getStatus(taskId) === 'viewed';
  }

  /** Check if task was recently updated (within expiry time) */
  isRecentlyUpdated(taskId: string): boolean {
    return this.getStatus(taskId) === 'updated';
  }

  /** Clear status for a task (sets to normal) */
  clearStatus(taskId: string): void {
    this.statusMap.delete(taskId);
    this.emitCurrentStatuses();
  }

  /** Clear all statuses */
  clearAll(): void {
    this.statusMap.clear();
    this.emitCurrentStatuses();
  }

  /** Get time remaining before status expires (in milliseconds) */
  getTimeToExpiry(taskId: string): number | null {
    const timedStatus = this.statusMap.get(taskId);
    if (!timedStatus || !timedStatus.expiresAt) return null;

    return Math.max(0, timedStatus.expiresAt - Date.now());
  }

  /** Manually trigger cleanup of expired statuses */
  cleanupExpiredStatuses(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [taskId, timedStatus] of this.statusMap.entries()) {
      if (this.isExpired(timedStatus)) {
        this.statusMap.delete(taskId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.emitCurrentStatuses();
    }
  }

  /** Check if a timed status has expired */
  private isExpired(timedStatus: TimedStatus): boolean {
    if (!timedStatus.expiresAt) return false; // Never expires
    return Date.now() > timedStatus.expiresAt;
  }

  /** Emit current non-expired statuses to subscribers */
  private emitCurrentStatuses(): void {
    const currentStatuses = new Map<string, TaskUiStatus>();

    for (const [taskId, timedStatus] of this.statusMap.entries()) {
      if (!this.isExpired(timedStatus)) {
        currentStatuses.set(taskId, timedStatus.status);
      }
    }

    this.statusSubject.next(currentStatuses);
  }

  /** Get all tasks with a specific status */
  getTasksWithStatus(status: TaskUiStatus): string[] {
    const taskIds: string[] = [];

    for (const [taskId, timedStatus] of this.statusMap.entries()) {
      if (!this.isExpired(timedStatus) && timedStatus.status === status) {
        taskIds.push(taskId);
      }
    }

    return taskIds;
  }
}
