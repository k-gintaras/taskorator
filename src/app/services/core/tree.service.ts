/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { EventBusService } from './event-bus.service';
import { TreeStrategy } from './interfaces/tree-strategy.interface';
import { ConfigService } from './config.service';
import { TaskTree } from 'src/app/models/taskTree';
import { TreeNodeService } from './tree-node.service';
import { Task } from 'src/app/models/taskModelManager';
import { CoreService } from './core.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

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
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  getTree(): BehaviorSubject<TaskTree | null> {
    if (this.treeSubject.value === null && this.authService.isAuthenticated()) {
      this.fetchTree();
    }
    return this.treeSubject;
  }

  private async fetchTree(): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }

      let tree = await this.cacheService.getTree();
      if (!tree) {
        tree = await this.apiService.getTree(userId);
        if (!tree) {
          throw new Error('No tree found');
        }

        this.cacheService.updateTree(tree);
        console.log('tree from api?');
      } else {
        console.log('tree from cache?');
      }
      this.treeSubject.next(tree);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
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
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
