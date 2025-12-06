import { Injectable } from '@angular/core';
import { TreeStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { TreeNodeService } from '../tree/tree-node.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultTree, TaskTree, TaskNodeInfo } from '../../models/taskTree';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ROOT_TASK_ID, TaskoratorTask } from '../../models/taskModelManager';
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
    private treeNodeToolsService: TaskTreeNodeToolsService,
    private treeNodeService: TreeNodeService
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

  findPathStringToTask(taskId: string): string {
    const tree = this.getLatestTree();
    if (!tree) return '';
    return this.treeNodeToolsService.findPathStringToTask(taskId, tree);
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

  // 🔥 NEW: Add a single task to the tree structure
  async addTaskToTree(task: TaskoratorTask): Promise<void> {
    if (!this.apiService) {
      throw new Error('API service not initialized.');
    }

    try {
      let tree = this.getLatestTree();

      if (!tree) {
        await this.fetchTree();
        tree = this.getLatestTree();
      }

      if (!tree) {
        tree = getDefaultTree();
      }

      await this.treeNodeService.createTasks(tree, [task]);

      await this.updateTree(tree);
    } catch (error) {
      console.error('Error adding task to tree:', error);
    }
  }

  async ensureTasksInTree(tasks: TaskoratorTask[]): Promise<void> {
    if (!tasks.length || !this.apiService) {
      return;
    }

    try {
      let tree = this.getLatestTree();

      if (!tree) {
        await this.fetchTree();
        tree = this.getLatestTree();
      }

      if (!tree) {
        tree = getDefaultTree();
      }

      const missing = tasks.filter((task) => {
        const inTree = !!this.treeNodeToolsService.findNodeById(
          tree!.primarch,
          task.taskId
        );
        const inAbyss = tree!.abyss.some((node) => node.taskId === task.taskId);
        return !inTree && !inAbyss;
      });

      if (!missing.length) {
        return;
      }

      await this.treeNodeService.createTasks(tree, missing);
      await this.updateTree(tree);
    } catch (error) {
      console.error('Error ensuring tasks are in tree:', error);
    }
  }

  // 🔥 NEW: Rebuild tree from all tasks when structure changes
  async rebuildTree(): Promise<void> {
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

  // Update local cache without issuing an API call. Useful for optimistic
  // local updates when we don't want to persist immediately.
  updateLocalTreeCache(taskTree: TaskTree): void {
    this.cacheService.updateTree(taskTree);
    this.treeSubject.next(taskTree);
  }
}
