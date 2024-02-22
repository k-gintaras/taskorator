import { Injectable } from '@angular/core';
import { EventBusService } from './event-bus.service';
import { TreeStrategy } from './interfaces/tree-strategy.interface';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';
import { LogService } from './log.service';
import ApiService from './api.service';
import { TaskTree } from 'src/app/models/taskTree';

@Injectable({
  providedIn: 'root',
})
export class TreeService implements TreeStrategy {
  private authService!: AuthService;
  private cacheService!: CacheService;
  private apiService!: ApiService;
  private errorHandlingService!: ErrorService;

  constructor(
    private configService: ConfigService,
    private logService: LogService
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.authService = this.configService.getAuthStrategy();
    this.cacheService = this.configService.getCacheStrategy();
    this.apiService = this.configService.getApiStrategy();
    this.errorHandlingService = this.configService.getErrorHandlingStrategy();
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.createTree(userId, taskTree);
      await this.cacheService.createTree(taskTree);
      return taskTree;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async getTree(): Promise<TaskTree> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      let tree = await this.cacheService.getTree();
      if (!tree) {
        tree = await this.apiService.getTree(userId);
        if (!tree) {
          throw new Error('No tree found');
        }
        this.cacheService.updateTree(tree);
      }
      return tree;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateTree(taskTree: TaskTree): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.updateTree(userId, taskTree);
      this.cacheService.updateTree(taskTree);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
