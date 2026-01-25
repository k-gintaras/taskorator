import { Injectable } from '@angular/core';
import { TreeStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { BehaviorSubject } from 'rxjs';
import {  TaskTree, TaskNodeInfo } from '../../models/taskTree';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';
import { UiTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TreeService implements TreeStrategy {
  private treeSubject: BehaviorSubject<TaskTree | null> =
    new BehaviorSubject<TaskTree | null>(null);
  private apiService: ApiStrategy | null = null;

  constructor(
    private cacheService: CacheOrchestratorService,
    private treeNodeToolsService: TaskTreeNodeToolsService,
  ) {}

  getFlattenedTree(tree: TaskTree) {
    return this.treeNodeToolsService.getFlattened(tree);
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    try {
      if (!this.apiService) return null;
      const createdTree = await this.apiService.createTree(taskTree);
      this.cacheService.createTree(taskTree);
      this.treeSubject.next(createdTree);
      return createdTree;
    } catch (error) {
      console.error('Error creating tree:', error);
      return null;
    }
  }

  getTaskTreeData(id: string): TaskNodeInfo | null {
    const tree = this.getLatestTree();
    if (!tree) return null;
    return this.treeNodeToolsService.getTaskInfo(tree, id);
  }

  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    this.fetchTree().then();
  }

  async fetchTree(): Promise<void> {
    try {
      let tree = await this.cacheService.getTree();
      if (!tree && this.apiService) {
        tree = await this.apiService.getTree();
        if (tree) {
          this.cacheService.createTree(tree);
        }
      }
      this.treeSubject.next(tree || null);
    } catch (error) {
      console.error('Error fetching tree:', error);
      this.treeSubject.next(null);
    }
  }

  // 🔥 FIX: Update both API and local cache
  async updateTree(taskTree: TaskTree): Promise<void> {
    if (!this.apiService) {
      throw new Error('API service not initialized.');
    }

    try {
      // Update API
      await this.apiService.updateTree(taskTree);

      // 🔥 CRITICAL: Update local cache AND BehaviorSubject
      this.cacheService.updateTree(taskTree);
      this.treeSubject.next(taskTree); // This was missing!
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  }

  getTree() {
    return this.treeSubject.asObservable();
  }

  getLatestTree(): TaskTree | null {
    return this.treeSubject.getValue();
  }

  // 🔥 NEW: Rebuild tree from all tasks when structure changes
  async getTreeFromApi(): Promise<void> {
    if (!this.apiService) {
      throw new Error('API service not initialized.');
    }

    try {
      // Fetch fresh tree from API (which should rebuild it from all tasks)
      const freshTree = await this.apiService.getTree();
      if (freshTree) {
        // Update local cache and notify subscribers
        this.cacheService.updateTree(freshTree);
        this.treeSubject.next(freshTree);
      }
    } catch (error) {
      console.error('Error rebuilding tree:', error);
      throw error;
    }
  }

  /**
   * Update local cache and notify subscribers without calling the API.
   * Useful for optimistic/local-only updates.
   */
  updateLocalTreeCache(taskTree: TaskTree): void {
    try {
      this.cacheService.updateTree(taskTree);
      this.treeSubject.next(taskTree);
    } catch (err) {
      console.error('Error updating local tree cache:', err);
    }
  }
}
