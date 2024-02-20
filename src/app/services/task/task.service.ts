import { Injectable } from '@angular/core';
import { CacheStrategy } from '../core/interfaces/cache-strategy.interface';
import { ErrorHandlingStrategy } from '../core/interfaces/error-handling-strategy.interface';
import { TaskStrategy } from '../core/interfaces/task-strategy.interface';
import { ApiStrategy } from '../core/interfaces/api-strategy.interface';
import { AuthStrategy } from '../core/interfaces/auth-strategy.interface';
import { Task } from 'src/app/models/taskModelManager';
import { ConfigService } from '../core/config.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService implements TaskStrategy {
  private authStrategy!: AuthStrategy;
  private cacheStrategy!: CacheStrategy;
  private apiStrategy!: ApiStrategy;
  private errorHandlingStrategy!: ErrorHandlingStrategy;

  constructor(private configService: ConfigService) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.authStrategy = this.configService.getAuthStrategy();
    this.cacheStrategy = this.configService.getCacheStrategy();
    this.apiStrategy = this.configService.getApiStrategy();
    this.errorHandlingStrategy = this.configService.getErrorHandlingStrategy();
  }

  async getTasks(): Promise<Task[]> {
    try {
      const userId = await this.authStrategy.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      let tasks = this.cacheStrategy.get(`tasks-${userId}`);
      if (!tasks) {
        tasks = await this.apiStrategy.getTasks(userId);
        this.cacheStrategy.set(`tasks-${userId}`, tasks);
      }
      return tasks;
    } catch (error) {
      this.errorHandlingStrategy.handleError(error);
      return Promise.reject(error);
    }
  }
}
