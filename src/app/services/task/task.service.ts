import { Injectable } from '@angular/core';
import { Task } from 'src/app/models/taskModelManager';
import { ConfigService } from '../core/config.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskManagementStrategy } from '../core/interfaces/task-management-strategy.interface';
import { Observable, catchError, from, switchMap, tap, throwError } from 'rxjs';
import { ErrorService } from '../core/error.service';
import { AuthService } from '../core/auth.service';
import { CacheService } from '../core/cache.service';
import ApiService from '../core/api.service';
import { LogService } from '../core/log.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService implements TaskManagementStrategy {
  private authService!: AuthService;
  private cacheService!: CacheService;
  private apiService!: ApiService;
  private errorHandlingService!: ErrorService;

  constructor(
    private configService: ConfigService,
    private eventBusService: EventBusService,
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

  async createTask(task: Task): Promise<Task> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      const createdTask = await this.apiService.createTask(userId, task);
      this.eventBusService.createTask(createdTask);
      return createdTask;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.updateTask(userId, task);
      this.eventBusService.updateTask(task);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async createTasks(tasks: Task[]): Promise<Task[]> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      const createdTasks = await this.apiService.createTasks(userId, tasks);
      this.eventBusService.createTasks(createdTasks);
      return createdTasks;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.updateTasks(userId, tasks);
      this.eventBusService.updateTasks(tasks);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  getTaskById(taskId: string): Observable<Task | undefined> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
        }
        return (
          this.cacheService.getTaskById(taskId) ||
          this.apiService.getTaskById(userId, taskId).pipe(
            tap((task) => {
              if (task) {
                this.cacheService.addCacheTask(task);
              } else {
                throw new Error('No such task found');
              }
            }),
            catchError((error) => {
              this.errorHandlingService.handleError(error);
              return throwError(() => new Error(error));
            })
          )
        );
      })
    );
  }

  getLatestTaskId(): Observable<string | undefined> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
        }
        return (
          this.cacheService.getLatestTaskId() ||
          this.apiService.getLatestTaskId(userId).pipe(
            catchError((error) => {
              this.errorHandlingService.handleError(error);
              return throwError(() => new Error(error));
            })
          )
        );
      })
    );
  }

  getSuperOverlord(taskId: string): Observable<Task | undefined> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
        }
        return (
          this.cacheService.getSuperOverlord(taskId) ||
          this.apiService.getSuperOverlord(userId, taskId).pipe(
            tap((task) => {
              if (task) {
                this.cacheService.addCacheTask(task);
              } else {
                throw new Error('No such task found');
              }
            }),
            catchError((error) => {
              this.errorHandlingService.handleError(error);
              return throwError(() => new Error(error));
            })
          )
        );
      })
    );
  }

  getOverlordChildren(taskId: string): Observable<Task[] | undefined> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((userId) => {
        if (!userId) {
          throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
        }
        return (
          this.cacheService.getOverlordChildren(taskId) ||
          this.apiService.getOverlordChildren(userId, taskId).pipe(
            tap((tasks) => {
              if (tasks) {
                this.cacheService.addCacheTasks(taskId, tasks);
              } else {
                throw new Error('No such task found');
              }
            }),
            catchError((error) => {
              this.errorHandlingService.handleError(error);
              return throwError(() => new Error(error));
            })
          )
        );
      })
    );
  }

  // TODO: we may never use it, due to how heavy it is if 500 tasks or more...
  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }
}
