import { Injectable } from '@angular/core';
import { TreeStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { BehaviorSubject } from 'rxjs';
import { TaskTree, TaskNodeInfo } from '../../models/taskTree';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TreeService implements TreeStrategy {
  /**
   * IMPORTANT:
   * Task documents are the canonical source of truth.
   * This tree is a helper index for overview/navigation and is intentionally
   * allowed to lag behind recent task changes to avoid expensive full-tree
   * writes to Firebase on every mutation.
   *
   * Durable tree writes should happen only at explicit repair/reconciliation
   * points. Local tree cache updates are UI helpers only.
   */
  private treeSubject: BehaviorSubject<TaskTree | null> =
    new BehaviorSubject<TaskTree | null>(null);
  private apiService: ApiStrategy | null = null;

  private ensureApiService(): ApiStrategy {
    if (!this.apiService) {
      throw new Error('API service is not initialized.');
    }
    return this.apiService;
  }

  constructor(
    private cacheService: CacheOrchestratorService,
    private treeNodeToolsService: TaskTreeNodeToolsService
  ) {}

  getFlattenedTree(tree: TaskTree) {
    return this.treeNodeToolsService.getFlattened(tree);
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    try {
      const api = this.ensureApiService();
      const createdTree = await api.createTree(taskTree);
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
      if (!tree) {
        try {
          const api = this.ensureApiService();
          tree = await api.getTree();
          if (tree) {
            this.cacheService.createTree(tree);
          }
        } catch (err) {
          console.warn('TreeService: API getTree failed or unavailable, using cache', err);
        }
      }
      this.treeSubject.next(tree || null);
    } catch (error) {
      console.error('Error fetching tree:', error);
      this.treeSubject.next(null);
    }
  }

  /**
   * Persist the current helper-tree snapshot to the API.
   * Use this only at explicit repair/reconciliation points.
   */
  async updateTree(taskTree: TaskTree): Promise<void> {
    try {
      const api = this.ensureApiService();
      await api.updateTree(taskTree);
      this.cacheService.updateTree(taskTree);
      this.treeSubject.next(taskTree);
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

  /**
   * Fetch a fresh helper-tree snapshot from the API.
   * Note that the API tree may itself lag behind the latest task truth until
   * a repair/reconciliation point has saved it.
   */
  async getTreeFromApi(): Promise<void> {
    try {
      const api = this.ensureApiService();
      const freshTree = await api.getTree();
      if (freshTree) {
        this.cacheService.updateTree(freshTree);
        this.treeSubject.next(freshTree);
      }
    } catch (error) {
      console.error('Error rebuilding tree:', error);
      throw error;
    }
  }

  /**
   * Update the local helper-tree snapshot without calling the API.
   * This is intentionally NOT a durable write.
   *
   * Any caller using this method must assume the tree can still be stale
   * compared with canonical task documents after reload or cross-device usage.
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
