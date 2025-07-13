import { Injectable } from '@angular/core';
import { TaskoratorTask, UiTask } from '../../../models/taskModelManager';
import { TreeService } from '../../sync-api-cache/tree.service';
import { ColorService } from '../../utils/color.service';
import { SelectedMultipleService } from '../selected/selected-multiple.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskTransmutationService } from '../task-transmutation.service';
import { TaskStatusService } from '../task-status.service';

@Injectable({
  providedIn: 'root',
})
export class TaskEnhancementService {
  private recentlyCreatedThreshold = 24 * 60 * 60 * 1000; // 24 hours
  private recentlyUpdatedThreshold = 2 * 60 * 60 * 1000; // 2 hours

  constructor(
    private selectedService: SelectedMultipleService,
    private colorService: ColorService,
    private taskUsageService: TaskUsageService,
    private taskTransmutationService: TaskTransmutationService,
    private taskStatusService: TaskStatusService,
    private treeService: TreeService
  ) {}

  /**
   * Enhance a single task with UI state
   */
  enhance(task: TaskoratorTask): UiTask {
    const treeNode = this.treeService.getTaskTreeData(task.taskId);
    const now = Date.now();

    const transmutedTask = this.taskTransmutationService.toUiTask(task);

    return {
      ...transmutedTask,
      isSelected: this.selectedService.isSelected(task),
      isRecentlyViewed: this.isTaskViewed(task.taskId),
      completionPercent: this.colorService.getProgressPercent(treeNode),
      color: this.colorService.getDateBasedColor(task.timeCreated),
      views: this.getViewCount(task.taskId), // You'll need to implement view tracking
      isRecentlyUpdated: now - task.lastUpdated < this.recentlyUpdatedThreshold,
      isRecentlyCreated: now - task.timeCreated < this.recentlyCreatedThreshold,
      isConnectedToTree: treeNode?.connected ?? false,
      children: treeNode?.childrenCount || 0,
      completedChildren: treeNode?.completedChildrenCount || 0,
      secondaryColor: this.getPriorityColor(task.priority),
      magnitude: this.calculateMagnitude(task),
    };
  }

  isTaskViewed(taskId: string): boolean {
    return this.taskStatusService.getStatus(taskId) === 'viewed';
  }

  /**
   * Enhance multiple tasks
   */
  enhanceTasks(rawTasks: TaskoratorTask[]): UiTask[] {
    return rawTasks.map((task) => this.enhance(task));
  }

  /**
   * Get priority-based color for secondary color
   */
  private getPriorityColor(priority: number): string {
    if (priority >= 8) return '#ef4444'; // red
    if (priority >= 6) return '#f97316'; // orange
    if (priority >= 4) return '#eab308'; // yellow
    if (priority >= 2) return '#22c55e'; // green
    return '#6b7280'; // gray
  }

  /**
   * Calculate magnitude (size/importance) of task
   */
  private calculateMagnitude(task: TaskoratorTask): number {
    let magnitude = task.priority; // Base on priority

    // Boost if has children
    const treeNode = this.treeService.getTaskTreeData(task.taskId);
    if (treeNode && treeNode.childrenCount > 0) {
      magnitude += treeNode.childrenCount * 0.5;
    }

    // Boost for certain task types
    // if (task.type === 'milestone') magnitude += 2;
    // if (task.size === 'large') magnitude += 1;

    // Cap at reasonable range (0-10)
    return Math.min(Math.max(magnitude, 0), 10);
  }

  /**
   * Get view count for a task (placeholder - implement based on your needs)
   */
  private getViewCount(taskId: string): number {
    return this.taskUsageService.getTaskViews(taskId);
  }
}
