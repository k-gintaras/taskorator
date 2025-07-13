import { Injectable } from '@angular/core';
import { TaskoratorTask, UiTask } from '../../../models/taskModelManager';
import { TreeService } from '../../sync-api-cache/tree.service';
import { ColorService } from '../../utils/color.service';
import { SelectedMultipleService } from '../selected/selected-multiple.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskTransmutationService } from '../task-transmutation.service';
import { TaskStatusService } from '../task-status.service';
import { combineLatest, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TaskEnhancementService {
  private recentlyCreatedThreshold = 24 * 60 * 60 * 1000;
  private recentlyUpdatedThreshold = 2 * 60 * 60 * 1000;

  constructor(
    private selectedService: SelectedMultipleService,
    private colorService: ColorService,
    private taskUsageService: TaskUsageService,
    private taskTransmutationService: TaskTransmutationService,
    private taskStatusService: TaskStatusService,
    private treeService: TreeService
  ) {}

  /**
   * Pure reactive enhancement - no caching needed!
   * The underlying services (TaskService, TreeService) already handle caching
   */
  enhanceTasksReactive(rawTasks: TaskoratorTask[]): Observable<UiTask[]> {
    return combineLatest([
      this.selectedService.getSelectedTasks(),
      this.taskStatusService.statuses$,
    ]).pipe(
      map(() => this.enhanceTasks(rawTasks)),
      // Only emit if selection/status actually changed
      distinctUntilChanged((prev, curr) => this.tasksEqual(prev, curr))
    );
  }

  /**
   * Simple enhancement - let existing caches do their job
   */
  enhanceTasks(rawTasks: TaskoratorTask[]): UiTask[] {
    return rawTasks.map((task) => this.enhance(task));
  }

  /**
   * Enhance single task (all data comes from already-cached services)
   */
  enhance(task: TaskoratorTask): UiTask {
    const now = Date.now();

    // These calls hit existing caches, not new API calls:
    const treeNode = this.treeService.getTaskTreeData(task.taskId); // Cached in TreeService
    const isSelected = this.selectedService.isSelected(task); // In-memory set
    const isViewed = this.isTaskViewed(task.taskId); // In-memory map
    const views = this.getViewCount(task.taskId); // localStorage

    const transmutedTask = this.taskTransmutationService.toUiTask(task);

    return {
      ...transmutedTask,
      isSelected,
      isRecentlyViewed: isViewed,
      completionPercent: this.colorService.getProgressPercent(treeNode),
      color: this.colorService.getDateBasedColor(task.timeCreated),
      views,
      isRecentlyUpdated: now - task.lastUpdated < this.recentlyUpdatedThreshold,
      isRecentlyCreated: now - task.timeCreated < this.recentlyCreatedThreshold,
      isConnectedToTree: treeNode?.connected ?? false,
      children: treeNode?.childrenCount || 0,
      completedChildren: treeNode?.completedChildrenCount || 0,
      secondaryColor: this.getPriorityColor(task.priority),
      magnitude: this.calculateMagnitude(task),
    };
  }

  /**
   * Compare tasks to prevent unnecessary re-renders
   */
  private tasksEqual(prev: UiTask[], curr: UiTask[]): boolean {
    if (prev.length !== curr.length) return false;

    return prev.every((prevTask, i) => {
      const currTask = curr[i];
      return (
        prevTask.taskId === currTask.taskId &&
        prevTask.isSelected === currTask.isSelected &&
        prevTask.isRecentlyViewed === currTask.isRecentlyViewed
      );
    });
  }

  // Helper methods...
  isTaskViewed(taskId: string): boolean {
    return this.taskStatusService.getStatus(taskId) === 'viewed';
  }

  private getPriorityColor(priority: number): string {
    if (priority >= 8) return '#ef4444';
    if (priority >= 6) return '#f97316';
    if (priority >= 4) return '#eab308';
    if (priority >= 2) return '#22c55e';
    return '#6b7280';
  }

  private calculateMagnitude(task: TaskoratorTask): number {
    let magnitude = task.priority;
    const treeNode = this.treeService.getTaskTreeData(task.taskId);
    if (treeNode && treeNode.childrenCount > 0) {
      magnitude += treeNode.childrenCount * 0.5;
    }
    return Math.min(Math.max(magnitude, 0), 10);
  }

  private getViewCount(taskId: string): number {
    return this.taskUsageService.getTaskViews(taskId);
  }
}
