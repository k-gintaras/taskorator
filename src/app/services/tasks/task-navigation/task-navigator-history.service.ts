import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { ROOT_TASK_ID, ROOT_TASK_NAME } from '../../../models/taskModelManager';

export interface NavigationEntry {
  taskListKey: TaskListKey;
  taskId?: string; // The specific task that was selected/viewed
  taskName?: string; // Store task name for display
  timestamp: Date;
  displayName?: string; // For breadcrumb display
}

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorHistoryService {
  private history: NavigationEntry[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  private historySubject = new BehaviorSubject<NavigationEntry[]>([]);
  private currentEntrySubject = new BehaviorSubject<NavigationEntry | null>(
    null
  );

  public history$ = this.historySubject.asObservable();
  public currentEntry$ = this.currentEntrySubject.asObservable();

  constructor() {}

  /**
   * Add a new navigation entry to history
   */
  /**
   * Add a new navigation entry to history
   */
  pushNavigation(
    taskListKey: TaskListKey,
    taskId?: string,
    displayName?: string
  ): void {
    const entry: NavigationEntry = {
      taskListKey,
      taskId,
      timestamp: new Date(),
      displayName: displayName || this.generateDisplayName(taskListKey, taskId),
    };

    // Remove any existing duplicate entries
    const existingIndex = this.history.findIndex((existingEntry) =>
      this.entriesEqual(existingEntry, entry)
    );

    if (existingIndex !== -1) {
      // Remove the existing entry
      this.history.splice(existingIndex, 1);

      // Adjust currentIndex if needed
      if (existingIndex <= this.currentIndex) {
        this.currentIndex--;
      }
    }

    // Remove any entries after current index (when navigating back then forward)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new entry
    this.history.push(entry);
    this.currentIndex = this.history.length - 1;

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.currentIndex = this.history.length - 1;
    }

    this.updateSubjects();
  }

  /**
   * Navigate back in history
   */
  goBack(): NavigationEntry | null {
    if (this.canGoBack()) {
      this.currentIndex--;
      this.updateSubjects();
      return this.getCurrentEntry();
    }
    return null;
  }

  /**
   * Check if we can go back
   */
  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Get current navigation entry
   */
  getCurrentEntry(): NavigationEntry | null {
    return this.currentIndex >= 0 && this.currentIndex < this.history.length
      ? this.history[this.currentIndex]
      : null;
  }

  /**
   * Get previous navigation entry
   */
  getPreviousEntry(): NavigationEntry | null {
    const prevIndex = this.currentIndex - 1;
    return prevIndex >= 0 && prevIndex < this.history.length
      ? this.history[prevIndex]
      : null;
  }

  /**
   * Get breadcrumb trail (current + parents)
   */
  getBreadcrumbs(): NavigationEntry[] {
    return this.history.slice(
      Math.max(0, this.currentIndex - 5),
      this.currentIndex + 1
    );
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.updateSubjects();
  }

  /**
   * Get full history for debugging
   */
  getFullHistory(): NavigationEntry[] {
    return [...this.history];
  }

  /**
   * Jump to a specific entry in history
   */
  jumpToEntry(targetEntry: NavigationEntry): boolean {
    const index = this.history.findIndex((entry) =>
      this.entriesEqual(entry, targetEntry)
    );

    if (index !== -1) {
      this.currentIndex = index;
      this.updateSubjects();
      return true;
    }
    return false;
  }

  private entriesEqual(
    entry1: NavigationEntry,
    entry2: NavigationEntry
  ): boolean {
    return entry1.taskId === entry2.taskId;
  }

  private generateDisplayName(
    taskListKey: TaskListKey,
    taskId?: string
  ): string {
    switch (taskListKey.type) {
      case TaskListType.OVERLORD:
        return taskId === ROOT_TASK_ID
          ? ROOT_TASK_NAME
          : `${taskId?.substring(0, 8)}...`;
      case TaskListType.DAILY:
        return 'Daily Tasks';
      case TaskListType.WEEKLY:
        return 'Weekly Tasks';
      case TaskListType.MONTHLY:
        return 'Monthly Tasks';
      case TaskListType.YEARLY:
        return 'Yearly Tasks';
      case TaskListType.LATEST_UPDATED:
        return 'Latest Updated';
      case TaskListType.LATEST_CREATED:
        return 'Latest Created';
      case TaskListType.FOCUS:
        return 'Focus Tasks';
      case TaskListType.FROG:
        return 'Frog Tasks';
      case TaskListType.FAVORITE:
        return 'Favorites';
      case TaskListType.SESSION:
        return 'Session Tasks';
      default:
        return `${taskListKey.type}: ${taskListKey.data || 'Unknown'}`;
    }
  }

  private updateSubjects(): void {
    this.historySubject.next([...this.history]);
    this.currentEntrySubject.next(this.getCurrentEntry());
  }
}
