// src/app/services/tasks/task-list/task-ui-decorator.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskoratorTask, UiTask } from '../../../models/taskModelManager';
import { TreeService } from '../../sync-api-cache/tree.service';
import { ColorService } from '../../utils/color.service';
import { TaskUsageService } from '../task-usage.service';
import { TaskTransmutationService } from '../task-transmutation.service';
import { TaskCacheService } from '../../cache/task-cache.service';

@Injectable({
  providedIn: 'root',
})
export class TaskUiDecoratorService {
  private recentlyViewedTaskIds = new Set<string>();
  private selectedTaskIds = new Set<string>();
  private selectedTasks$ = new BehaviorSubject<UiTask[]>([]);
  private uiStateChangesSubject = new BehaviorSubject<void>(undefined);
  uiStateChanges$ = this.uiStateChangesSubject.asObservable();

  private recentlyCreatedThreshold = 24 * 60 * 60 * 1000;
  private recentlyUpdatedThreshold = 2 * 60 * 60 * 1000;

  constructor(
    private colorService: ColorService,
    private taskUsageService: TaskUsageService,
    private taskTransmutationService: TaskTransmutationService,
    private treeService: TreeService,
    private taskCache: TaskCacheService
  ) {}

  markTaskViewed(taskId: string): void {
    this.recentlyViewedTaskIds.add(taskId);
    this.uiStateChangesSubject.next();
  }

  markTaskSelected(taskId: string): void {
    this.selectedTaskIds.add(taskId);
    this.emitSelectedTasks();
    this.uiStateChangesSubject.next();
  }

  clearAllUiState(): void {
    this.selectedTaskIds.clear();
    this.recentlyViewedTaskIds.clear();
    this.emitSelectedTasks();
    this.uiStateChangesSubject.next();
  }

  toggleTaskSelection(taskId: string): void {
    if (this.selectedTaskIds.has(taskId)) {
      this.selectedTaskIds.delete(taskId);
    } else {
      this.selectedTaskIds.add(taskId);
    }
    this.emitSelectedTasks();
  }

  unselectTask(taskId: string): void {
    this.selectedTaskIds.delete(taskId);
    this.emitSelectedTasks();
  }

  clearSelected(): void {
    this.selectedTaskIds.clear();
    this.emitSelectedTasks();
  }

  get selectedTasksChanges$(): Observable<UiTask[]> {
    return this.selectedTasks$.asObservable();
  }

  private emitSelectedTasks(): void {
    const selected = this.getSelectedTaskIds()
      .map((id) => this.taskCache.getTask(id))
      .filter((task): task is UiTask => !!task);
    this.selectedTasks$.next(selected);
  }

  decorateTask(task: TaskoratorTask): UiTask {
    const now = Date.now();
    // 🔥 FIX: Update cache FIRST, then fetch tree node info
    const baseTask = this.taskTransmutationService.toUiTask(task);
    this.taskCache.addTask(baseTask); // Cache the updated task FIRST

    // Now fetch tree node info - this will use the updated cache
    const treeNode = this.treeService.getTaskTreeData(task.taskId);
    const views = this.taskUsageService.getTaskViews(task.taskId);

    const enhancedTask: UiTask = {
      ...baseTask,
      isSelected: this.selectedTaskIds.has(task.taskId),
      isRecentlyViewed: this.recentlyViewedTaskIds.has(task.taskId),
      isRecentlyUpdated: now - task.lastUpdated < this.recentlyUpdatedThreshold,
      isRecentlyCreated: now - task.timeCreated < this.recentlyCreatedThreshold,
      completionPercent: this.colorService.getProgressPercent(treeNode),
      color: this.colorService.getDateBasedColor(task.timeCreated),
      secondaryColor: this.getPriorityColor(task.priority),
      views,
      isConnectedToTree: treeNode?.connected ?? false,
      children: treeNode?.childrenCount || 0,
      completedChildren: treeNode?.completedChildrenCount || 0,
      magnitude: this.calculateMagnitude(task, treeNode),
    };

    // Update cache with the fully enhanced task
    this.taskCache.addTask(enhancedTask);
    return enhancedTask;
  }

  decorateTasks(tasks: TaskoratorTask[]): UiTask[] {
    return tasks.map((task) => this.decorateTask(task));
  }

  private getPriorityColor(priority: number): string {
    if (priority >= 8) return '#ef4444';
    if (priority >= 6) return '#f97316';
    if (priority >= 4) return '#eab308';
    if (priority >= 2) return '#22c55e';
    return '#6b7280';
  }

  private calculateMagnitude(task: TaskoratorTask, treeNode: any): number {
    let magnitude = task.priority;
    if (treeNode && treeNode.childrenCount > 0) {
      magnitude += treeNode.childrenCount * 0.5;
    }
    return Math.min(Math.max(magnitude, 0), 10);
  }

  getSelectedTaskIds(): string[] {
    return Array.from(this.selectedTaskIds);
  }
}
