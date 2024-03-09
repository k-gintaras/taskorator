import { Injectable } from '@angular/core';
import { Task } from 'src/app/models/taskModelManager';
import { ConfigService } from '../core/config.service';
import { EventBusService } from '../core/event-bus.service';
import { TaskManagementStrategy } from '../core/interfaces/task-management-strategy.interface';
import {
  Observable,
  catchError,
  from,
  mergeMap,
  of,
  switchMap,
  tap,
  throwError,
  EMPTY,
} from 'rxjs';
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
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
    }
    const createdTask = await this.apiService.createTask(userId, task);
    this.eventBusService.createTask(createdTask);
    return createdTask;
  }

  async updateTask(task: Task): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
    }
    await this.apiService.updateTask(userId, task);
    this.eventBusService.updateTask(task);
  }

  async createTasks(tasks: Task[]): Promise<Task[]> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
    }
    const createdTasks = await this.apiService.createTasks(userId, tasks);
    this.eventBusService.createTasks(createdTasks);
    return createdTasks;
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
    }
    await this.apiService.updateTasks(userId, tasks);
    this.eventBusService.updateTasks(tasks);
  }

  getTaskById(taskId: string): Observable<Task | undefined> {
    console.log(taskId + ' we are querying: ');
    return this.getUserIdObservable().pipe(
      switchMap((userId) => this.getCachedOrApiTask(userId, taskId))
    );
  }

  getLatestTaskId(): Observable<string | undefined> {
    return this.getUserIdObservable().pipe(
      switchMap((userId) =>
        userId
          ? this.cacheService.getLatestTaskId() ||
            this.apiService
              .getLatestTaskId(userId)
              .pipe(catchError((error) => this.handleError(error)))
          : EMPTY
      )
    );
  }

  getSuperOverlord(taskId: string): Observable<Task | undefined> {
    return this.getUserIdObservable().pipe(
      switchMap((userId) =>
        this.getCachedOrApiTask(userId, taskId, 'getSuperOverlord')
      )
    );
  }

  getOverlordChildren(taskId: string): Observable<Task[] | undefined> {
    return this.getUserIdObservable().pipe(
      switchMap((userId) =>
        this.getCachedOrApiTasks(userId, taskId, 'getOverlordChildren')
      )
    );
  }

  // TODO: we may never use it, due to how heavy it is if 500 tasks or more...
  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  private getUserId(): Promise<string | undefined> {
    return this.authService.getCurrentUserId().catch((error) => {
      this.handleError(error);
      throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
    });
  }

  private getUserIdObservable(): Observable<string | undefined> {
    return from(this.getUserId()).pipe(
      catchError((error) => {
        this.handleError(error);
        return EMPTY;
      })
    );
  }

  private getCachedOrApiTask(
    userId: string | undefined,
    taskId: string,
    apiMethod: 'getTaskById' | 'getSuperOverlord' = 'getTaskById'
  ): Observable<Task | undefined> {
    if (!userId || !this.cacheService || !this.apiService) {
      return EMPTY;
    }

    let cachedTask$: Observable<Task | undefined>;

    switch (apiMethod) {
      case 'getTaskById':
        cachedTask$ = this.cacheService.getTaskById(taskId);
        break;
      case 'getSuperOverlord':
        cachedTask$ = this.cacheService.getSuperOverlord(taskId);
        break;
      default:
        cachedTask$ = EMPTY;
    }

    return cachedTask$.pipe(
      switchMap((cachedTask) =>
        cachedTask
          ? of(cachedTask)
          : this.callApiMethod(apiMethod, userId, taskId)
      ),
      catchError((error) => this.handleError(error))
    );
  }

  private callApiMethod(
    apiMethod: 'getTaskById' | 'getSuperOverlord',
    userId: string,
    taskId: string
  ): Observable<Task | undefined> {
    switch (apiMethod) {
      case 'getTaskById':
        return this.apiService.getTaskById(userId, taskId).pipe(
          tap((task) => {
            if (task) {
              this.cacheService.addCacheTask(task);
            }
          })
        );
      case 'getSuperOverlord':
        return this.apiService.getSuperOverlord(userId, taskId).pipe(
          tap((task) => {
            if (task) {
              this.cacheService.addCacheTask(task);
            }
          })
        );
      default:
        return EMPTY;
    }
  }

  private getCachedOrApiTasks(
    userId: string | undefined,
    taskId: string,
    apiMethod: 'getOverlordChildren' = 'getOverlordChildren'
  ): Observable<Task[] | undefined> {
    if (!userId || !this.cacheService || !this.apiService) {
      return EMPTY;
    }

    let cachedTasks$: Observable<Task[] | undefined>;

    switch (apiMethod) {
      case 'getOverlordChildren':
        cachedTasks$ = this.cacheService.getOverlordChildren(taskId);
        console.log('cached??? ');
        break;
      default:
        cachedTasks$ = EMPTY;
    }

    console.log('cached??? ');
    console.log(cachedTasks$);

    return cachedTasks$.pipe(
      switchMap((cachedTasks) => {
        console.log('cached tasks:');
        console.log(cachedTasks);
        return cachedTasks
          ? of(cachedTasks)
          : this.callApiTasksMethod(apiMethod, userId, taskId);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private callApiTasksMethod(
    apiMethod: 'getOverlordChildren',
    userId: string,
    taskId: string
  ): Observable<Task[] | undefined> {
    switch (apiMethod) {
      case 'getOverlordChildren':
        return this.apiService.getOverlordChildren(userId, taskId).pipe(
          tap((tasks) => {
            console.log('getting tasks from server');
            console.log(tasks);

            if (tasks) {
              this.cacheService.addCacheTasks(taskId, tasks);
            }
          })
        );
      default:
        return EMPTY;
    }
  }

  private handleError(error: unknown): Observable<never> {
    this.errorHandlingService.handleError(error);
    return throwError(() => error);
  }
}
