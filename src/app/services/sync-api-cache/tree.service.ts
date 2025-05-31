/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { TreeStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { TreeNodeService } from '../tree/tree-node.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultTree, TaskTree, TaskNodeInfo } from '../../models/taskTree';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ROOT_TASK_ID } from '../../models/taskModelManager';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TreeService implements TreeStrategy {
  private treeSubject: BehaviorSubject<TaskTree | null> =
    new BehaviorSubject<TaskTree | null>(null);
  private apiService: ApiStrategy | null = null;

  constructor(
    private cacheService: CacheOrchestratorService,
    private treeNodeToolsService: TaskTreeNodeToolsService
  ) {}

  getFlattenedTree(tree: TaskTree) {
    console.log('Getting flattened tree');
    console.log(tree);
    return this.treeNodeToolsService.getFlattened(tree);
  }

  // Create a tree and save it to both cache and API
  async createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    try {
      if (!this.apiService) return null;
      const createdTree = await this.apiService.createTree(taskTree);
      this.cacheService.createTree(taskTree); // Update cache
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
    // TODO: use index ???
  }

  initialize(apiStrategy: ApiStrategy): void {
    console.log('TreeService initialized with API strategy');

    this.apiService = apiStrategy;
    this.fetchTree().then();
    // TODO: create index???
  }

  async fetchTree(): Promise<void> {
    try {
      let tree = await this.cacheService.getTree();
      if (!tree && this.apiService) {
        tree = await this.apiService.getTree();
        // we can fix tree here worst case scenario...
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

  findPathStringToTask(taskId: string): string {
    const tree = this.getLatestTree();
    if (!tree) return '';
    return this.treeNodeToolsService.findPathStringToTask(taskId, tree);
  }

  async updateTree(taskTree: TaskTree): Promise<void> {
    if (!this.apiService) {
      throw new Error('API service not initialized.');
    }

    try {
      await this.apiService.updateTree(taskTree);
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
}
