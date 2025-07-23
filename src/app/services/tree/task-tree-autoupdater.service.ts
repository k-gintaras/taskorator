// src/app/services/tree/task-tree-autoupdater.service.ts

import { Injectable } from '@angular/core';
import { TreeNodeService } from './tree-node.service';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskListService } from '../sync-api-cache/task-list.service';
import { Subject } from 'rxjs';
import {
  TaskActionTrackerService,
  TaskActions,
} from '../tasks/task-action-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeAutoupdaterService {
  private updateQueue = new Subject<void>();
  private isUpdating = false;

  constructor(
    private treeNodeService: TreeNodeService,
    private treeService: TreeService,
    private actionTracker: TaskActionTrackerService,
    private taskListService: TaskListService
  ) {
    this.listenToActions();
    this.setupUpdateQueue();
  }

  private listenToActions(): void {
    this.actionTracker.lastAction$.subscribe(async (action) => {
      if (!action) return;
      const tree = this.treeService.getLatestTree();
      if (!tree) return;

      switch (action.action) {
        case TaskActions.CREATED:
        case TaskActions.UPDATED:
        case TaskActions.MOVED:
          await this.handleCreateOrUpdate(tree, action.taskIds);
          break;
        case TaskActions.DELETED:
          await this.handleDelete(tree, action.taskIds);
          break;
        case TaskActions.COMPLETED:
          await this.handleCreateOrUpdate(tree, action.taskIds);
          break;
      }
      // this is triggered even if TaskActions.VIEWED... BAD

      if (this.isWorthUpdating(action.action)) {
        this.queueUpdate();
      }
    });
  }

  isWorthUpdating(action: TaskActions): boolean {
    switch (action) {
      case TaskActions.CREATED:
      case TaskActions.UPDATED:
      case TaskActions.MOVED:
      case TaskActions.DELETED:
      case TaskActions.COMPLETED:
        return true;
      default:
        return false;
    }
  }

  private async handleCreateOrUpdate(
    tree: any,
    taskIds: string[]
  ): Promise<void> {
    const tasks = await this.fetchTasksByIds(taskIds);
    if (tasks.length > 0) {
      await this.treeNodeService.updateTasks(tree, tasks);
      this.treeService.updateLocalTreeCache(tree);
    }
  }

  private async handleDelete(tree: any, taskIds: string[]): Promise<void> {
    const parentIds = new Set<string>();
    for (const taskId of taskIds) {
      const node = this.findNodeInTree(tree, taskId);
      if (node?.overlord) {
        parentIds.add(node.overlord);
      }
    }

    // Update cache immediately after tree changes
    this.treeService.updateLocalTreeCache(tree);
  }

  private findNodeInTree(tree: any, taskId: string): any {
    // Helper method to find a node in the tree
    // This should use the tree tools service or similar utility
    const findNode = (node: any): any => {
      if (node.taskId === taskId) return node;
      for (const child of node.children || []) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };

    return findNode(tree.primarch);
  }

  private async fetchTasksByIds(taskIds: string[]): Promise<TaskoratorTask[]> {
    const tasks = await this.taskListService.getTasksByIds(taskIds);
    return tasks ? tasks : [];
  }

  private setupUpdateQueue(): void {
    this.updateQueue.subscribe(async () => {
      if (this.isUpdating) return;
      this.isUpdating = true;

      try {
        const tree = this.treeService.getLatestTree();
        if (tree) {
          await this.treeService.updateTree(tree);
        }
      } catch (err) {
        console.error('Failed to auto-update tree', err);
      } finally {
        this.isUpdating = false;
      }
    });
  }

  private queueUpdate(): void {
    this.updateQueue.next();
  }
}
