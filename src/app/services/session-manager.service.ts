import { Injectable } from '@angular/core';
import { ApiStrategy } from '../models/service-strategies/api-strategy.interface';
import {
  AuthStrategy,
  AuthUser,
} from '../models/service-strategies/auth-strategy.interface';
import { AuthService } from './core/auth.service';
import { ApiFirebaseService } from './core/api-firebase.service';
import { ApiOfflineService } from './core/api-offline.service';
import { AuthOfflineService } from './core/auth-offline.service';
import { TaskService } from './sync-api-cache/task.service';
import { TaskListService } from './sync-api-cache/task-list.service';
import { TreeService } from './sync-api-cache/tree.service';
import { TaskTreeAutoupdaterService } from './tree/task-tree-autoupdater.service';
import { SettingsService } from './sync-api-cache/settings.service';
import { ScoreService } from './sync-api-cache/score.service';
import { RegistrationService } from './core/registration.service';
import { TaskTreeHealService } from './tree/task-tree-heal.service';
import { TaskBatchService } from './sync-api-cache/task-batch.service';
import { NavigationService } from './navigation.service';

@Injectable({ providedIn: 'root' })
export class SessionManagerService {
  private sessionType: 'online' | 'offline' | null = null;
  private apiStrategy!: ApiStrategy;
  private authStrategy!: AuthStrategy;
  user: AuthUser | null = null;
  private isInitialized = false;
  private initializationComplete: Promise<void>;
  private resolveInitialization!: () => void;

  constructor(
    private firebaseAuth: AuthService,
    private offlineAuth: AuthOfflineService,
    private firebaseApi: ApiFirebaseService,
    private localStorageApi: ApiOfflineService,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private treeService: TreeService,
    private taskBatch: TaskBatchService,
    private treeUpdaterService: TaskTreeAutoupdaterService,
    private treeHealService: TaskTreeHealService,
    private settingsService: SettingsService,
    private scoreService: ScoreService,
    private registrationService: RegistrationService,
    private navigationService: NavigationService
  ) {
    this.initializationComplete = new Promise((resolve) => {
      this.resolveInitialization = resolve;
    });
    console.log(this);
  }

  /**
   * waits for auth service to login
   * waits for services like task, tree, score to initiate with online or offline api
   * @param mode online offline
   */
  async initialize(mode: 'online' | 'offline'): Promise<void> {
    if (this.isInitialized) return;

    if (mode === 'online') {
      this.authStrategy = this.firebaseAuth;
      this.apiStrategy = this.firebaseApi;
      this.firebaseAuth.initialize(); // init here, so we don't login by accident

      // Wait for login state
      this.user = await this.waitForLogin();
      if (!this.user) {
        throw new Error('Login failed or user not authenticated.');
      } else {
        console.log('log: ' + this.user);
        console.log(`"log: " + this.user`);
      }
    } else if (mode === 'offline') {
      this.authStrategy = this.offlineAuth;
      this.apiStrategy = this.localStorageApi;
      this.offlineAuth.initialize(); // init here, so we don't login by accident
      this.user = await this.waitForLogin();

      if (!this.user) {
        throw new Error('Login failed or user not authenticated.');
      } else {
        console.log('log: ' + this.user);
        console.log(`"log: " + this.user`);
      }
    }

    this.sessionType = mode;
    console.log(`Session initialized: ${mode}`);

    if (!this.authStrategy.isAuthenticated()) {
      throw new Error('Login failed or user not authenticated.');
    }

    await this.initializeServices();
    this.isInitialized = true;
    this.resolveInitialization(); // Signal completion
  }

  async waitForInitialization(): Promise<boolean> {
    await this.initializationComplete;
    return true;
  }

  private initializeServices(): void {
    // TaskService
    this.taskService.initialize(this.apiStrategy);
    // SettingsService
    this.settingsService.initialize(this.apiStrategy);
    // ScoreService
    this.scoreService.initialize(this.apiStrategy);
    // TaskListService
    this.taskListService.initialize(this.apiStrategy);
    // TreeService
    this.treeService.initialize(this.apiStrategy);
    // RegistrationService
    this.registrationService.initialize(this.apiStrategy);
    // TaskBatchService
    this.taskBatch.initialize(this.apiStrategy);
  }

  private waitForLogin(): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject('Login timed out'), 10000); // 10 seconds timeout.

      this.authStrategy.getCurrentUser().subscribe((user) => {
        if (user) {
          clearTimeout(timeout);
          resolve(user);
        }
      });
    });
  }

  getApiStrategy(): ApiStrategy {
    if (!this.apiStrategy) {
      throw new Error('Session not initialized. Call initialize() first.');
    }
    return this.apiStrategy;
  }

  getAuthStrategy(): AuthStrategy {
    if (!this.authStrategy) {
      throw new Error('Session not initialized. Call initialize() first.');
    }
    return this.authStrategy;
  }

  /**
   *
   * @returns whether we are using online or offline version of app. useful if we want to tell user
   */
  getSessionType(): 'online' | 'offline' | null {
    return this.sessionType;
  }

  isLoggedIn(): boolean {
    return this.authStrategy.isAuthenticated();
  }
}
