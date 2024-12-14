import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TaskUsageService {
  private readonly storageKey = 'taskUsageData'; // Key for localStorage

  constructor() {}

  /**
   * Increment the view count for a task.
   * @param taskId - The ID of the task.
   */
  incrementTaskView(taskId: string): void {
    const usageData = this.getUsageData();
    const taskUsage = usageData[taskId] || { views: 0, lastViewed: 0 };

    taskUsage.views++;
    taskUsage.lastViewed = Date.now();

    usageData[taskId] = taskUsage;
    this.saveUsageData(usageData);
  }

  /**
   * Get view count for a task.
   * @param taskId - The ID of the task.
   * @returns The number of views for the task.
   */
  getTaskViews(taskId: string): number {
    const usageData = this.getUsageData();
    return usageData[taskId]?.views || 0;
  }

  /**
   * Get all usage data.
   * @returns An object mapping task IDs to usage details.
   */
  getAllUsageData(): { [taskId: string]: TaskUsage } {
    return this.getUsageData();
  }

  /**
   * Clear all usage data.
   */
  clearUsageData(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Retrieve usage data from localStorage.
   * @returns Parsed usage data object.
   */
  private getUsageData(): { [taskId: string]: TaskUsage } {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save usage data to localStorage.
   * @param usageData - The usage data to save.
   */
  private saveUsageData(usageData: { [taskId: string]: TaskUsage }): void {
    localStorage.setItem(this.storageKey, JSON.stringify(usageData));
  }
}

/**
 * Interface for task usage details.
 */
export interface TaskUsage {
  views: number; // Number of times the task was viewed
  lastViewed: number; // Timestamp of the last view
}
