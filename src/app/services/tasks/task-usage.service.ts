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

  getTaskUsage(taskId: string): TaskUsage | null {
    const usageData = this.getUsageData();
    return usageData[taskId] || null;
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
   * Get the most viewed tasks ordered by view count.
   * @param limit - Maximum number of tasks to return (default: 10)
   * @returns Array of task IDs ordered by view count (descending)
   */
  getMostViewedTasks(limit: number = 10): string[] {
    const usageData = this.getUsageData();
    
    // Convert to array and sort by view count (descending)
    const sortedTasks = Object.entries(usageData)
      .map(([taskId, usage]) => ({ taskId, views: usage.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map(item => item.taskId);

    return sortedTasks;
  }

  /**
   * Get recently viewed tasks ordered by last viewed timestamp.
   * @param limit - Maximum number of tasks to return (default: 10)
   * @returns Array of task IDs ordered by last viewed (most recent first)
   */
  getRecentlyViewedTasks(limit: number = 10): string[] {
    const usageData = this.getUsageData();
    
    // Convert to array and sort by last viewed timestamp (descending)
    const sortedTasks = Object.entries(usageData)
      .map(([taskId, usage]) => ({ taskId, lastViewed: usage.lastViewed }))
      .sort((a, b) => b.lastViewed - a.lastViewed)
      .slice(0, limit)
      .map(item => item.taskId);

    return sortedTasks;
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
