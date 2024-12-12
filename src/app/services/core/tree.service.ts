/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { EventBusService } from './event-bus.service';
import { TreeStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { ConfigService } from './config.service';
import { TreeNodeService } from './tree-node.service';
import { CoreService } from './core.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Task } from '../../models/taskModelManager';
import {
  TaskTree,
  TaskTreeNodeData,
  getDefaultTree,
} from '../../models/taskTree';
/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root',
})
export class TreeService extends CoreService implements TreeStrategy {
  private treeSubject: BehaviorSubject<TaskTree | null> =
    new BehaviorSubject<TaskTree | null>(null);

  constructor(
    configService: ConfigService,
    private eventBusService: EventBusService,
    private treeNodeService: TreeNodeService
  ) {
    super(configService);
    this.subscribeToTaskEvents();
  }

  // Method to check if task name is unique
  isNameUnique(taskName: string): boolean {
    const taskTree = this.treeSubject.getValue();
    if (!taskTree) return true; // If no tree, name is unique by default
    return !this.treeNodeService.findNodeByName(taskTree.root, taskName);
  }

  // Method to check if a task has children
  hasChildren(taskId: string): boolean {
    const taskTree = this.treeSubject.getValue();
    if (!taskTree) return false;
    return this.treeNodeService.hasChildren(taskTree, taskId);
  }

  // Method to check if a task has incomplete children
  hasIncompleteChildren(taskId: string): boolean {
    const taskTree = this.treeSubject.getValue();
    if (!taskTree) return false;
    return this.treeNodeService.hasIncompleteChildren(taskTree, taskId);
  }

  getTaskTreeData(taskId: string): TaskTreeNodeData | undefined {
    // Get the latest tree state from treeSubject
    const taskTree = this.treeSubject.getValue();

    // Check if taskTree is available
    if (!taskTree) return undefined;

    // Find the node for the given taskId
    const node = this.treeNodeService.findNodeById(taskTree.root, taskId);
    if (!node) return undefined;

    // Extract and return relevant data
    const data: TaskTreeNodeData = {
      isCompleted: node.isCompleted,
      overlord: node.overlord,
      childrenCount: node.childrenCount,
      completedChildrenCount: node.completedChildrenCount,
    };

    return data;
  }

  private subscribeToTaskEvents(): void {
    this.eventBusService.onEvent<any>('createTask').subscribe((task) => {
      this.handleCreateTask(task);
    });

    this.eventBusService.onEvent<any>('createTasks').subscribe((tasks) => {
      this.handleCreateTasks(tasks);
    });

    this.eventBusService.onEvent<any>('updateTask').subscribe((task) => {
      this.handleUpdateTask(task);
    });

    this.eventBusService.onEvent<any>('updateTasks').subscribe((tasks) => {
      this.handleUpdateTasks(tasks);
    });

    // in case tasks were not added before..., should fix on its own i think...
    // problem is this is called before due to getTasks... and if we create task, we get Tasks again chich is called before this...
    // yes but this is fixed now with if(notInTree) add...
    // it is also fixed if treeUpdated with missing, only then apiUpdateTree(tree)
    this.tryHealTreeIfNeeded();
  }

  private tryHealTreeIfNeeded() {
    if (this.configService.isRepairTreeEnabled()) {
      this.eventBusService
        .onEvent<any>('getTaskById')
        .subscribe((task: Task) => {
          if (task) {
            this.healTree([task]);
          }
        });
      this.eventBusService
        .onEvent<any>('getSuperOverlord')
        .subscribe((task: Task) => {
          if (task) {
            this.healTree([task]);
          }
        });
      this.eventBusService
        .onEvent<any>('getOverlordChildren')
        .subscribe((tasks: Task[]) => {
          if (tasks) {
            this.healTree(tasks);
          }
        });
    }
  }

  async findPathStringToTask(taskId: string): Promise<string> {
    const tree = this.treeSubject.getValue();
    if (!tree || !tree.root) return '';

    const pathNodes = this.treeNodeService.findPathToTask(taskId, tree.root);
    if (!pathNodes) return '';

    return pathNodes.map((node) => node.name).join(' >>> ');
  }

  private async healTree(tasks: Task[]): Promise<void> {
    const tree = await firstValueFrom(this.getTree());
    if (tree) {
      const treeUpdated = await this.treeNodeService.healTree(tree, tasks);
      if (treeUpdated) {
        this.updateTree(tree);
      }
    }
  }

  private async handleCreateTask(task: any): Promise<void> {
    const tree = await firstValueFrom(this.getTree());
    if (tree) {
      this.treeNodeService.createTask(tree, task);
      this.updateTree(tree);
    }
  }

  private async handleCreateTasks(tasks: any[]): Promise<void> {
    const tree = await firstValueFrom(this.getTree());
    if (tree) {
      await this.treeNodeService.createTasks(tree, tasks);
      this.updateTree(tree);
    }
  }

  private async handleUpdateTask(task: any): Promise<void> {
    const tree = await firstValueFrom(this.getTree());
    if (tree) {
      await this.treeNodeService.updateTask(tree, task);
      this.updateTree(tree);
    }
  }

  private async handleUpdateTasks(tasks: any[]): Promise<void> {
    const tree = await firstValueFrom(this.getTree());
    if (tree) {
      await this.treeNodeService.updateTasks(tree, tasks);
      this.updateTree(tree);
    }
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }

      await this.apiService.createTree(userId, taskTree);
      await this.cacheService.createTree(taskTree);
      this.treeSubject.next(taskTree);
      return taskTree;
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  getTree(): BehaviorSubject<TaskTree | null> {
    if (!this.treeSubject.value && this.authService.isAuthenticated()) {
      this.fetchTree(); // Initiate the fetch if the tree is null or empty
    }
    return this.treeSubject;
  }

  private async fetchTree(): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        console.warn('User is not logged in; cannot fetch tree.');
        return;
      }

      let tree = await this.cacheService.getTree();
      if (!tree) {
        tree = await this.apiService.getTree(userId);
        if (!tree) {
          console.log('Tree not found, initializing default tree.');
          tree = getDefaultTree(); // Initialize a default tree if none exists
          await this.createTree(tree);
        }
      }

      this.treeSubject.next(tree); // Only emit the tree after it is ready
    } catch (error) {
      console.error('Error fetching tree:', error);
      this.treeSubject.next(null); // Ensure we emit null explicitly if an error occurs
    }
  }
  async updateTree(taskTree: TaskTree): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }

      await this.apiService.updateTree(userId, taskTree);
      this.cacheService.updateTree(taskTree);
      this.treeSubject.next(taskTree);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  async getTreeOnce(): Promise<TaskTree | null> {
    try {
      let tree = await this.cacheService.getTree();
      if (!tree) {
        const userId = await this.authService.getCurrentUserId();
        if (!userId) return null;

        tree = await this.apiService.getTree(userId);
        if (!tree) return null;

        await this.cacheService.updateTree(tree);
      }
      return tree;
    } catch (error) {
      this.error(error);
      return null;
    }
  }
}
