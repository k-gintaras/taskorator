import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
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
import { OTHER_CONFIG } from '../app.config';

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
    // If already initialized with the same mode, just return
    if (this.isInitialized && this.sessionType === mode) {
      console.log(`Session already initialized in ${mode} mode`);
      return;
    }

    // If switching modes, reset initialization status
    if (this.isInitialized && this.sessionType !== mode) {
      console.log(`Switching from ${this.sessionType} to ${mode} mode`);
      this.isInitialized = false;
    }

    const isTestingSimple = OTHER_CONFIG.OFFLINE_TESTING;
    if (isTestingSimple) {
      mode = 'offline';
    }

    if (mode === 'online') {
      this.authStrategy = this.firebaseAuth;
      this.apiStrategy = this.firebaseApi;
      this.firebaseAuth.initialize(); // init here, so we don't login by accident

      // Wait for Firebase auth state to settle before checking authentication
      console.log('Waiting for Firebase auth state to settle...');
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('Auth state check timeout - proceeding anyway');
          resolve();
        }, 5000); // Increased timeout to 5 seconds

        let settled = false;
        let subscription: any;
        subscription = this.firebaseAuth.getCurrentUser().subscribe((user) => {
          console.log('Firebase auth state settled:', user ? `User: ${user.uid}` : 'No user');
          
          // Give Firebase more time to potentially restore auth state
          if (!settled) {
            settled = true;
            setTimeout(() => {
              clearTimeout(timeout);
              if (subscription) {
                subscription.unsubscribe();
              }
              resolve();
            }, 1000); // Wait additional 1 second after first auth state change
          }
        });
      });

      // Now check if user is authenticated
      if (this.firebaseAuth.isAuthenticated()) {
        console.log('User already authenticated');
        const currentUser = await this.firebaseAuth.getCurrentUser().pipe(take(1)).toPromise();
        if (currentUser) {
          this.user = currentUser;
          console.log('User authenticated: ' + this.user.uid);
        } else {
          console.log('Authentication state inconsistent - user appears authenticated but no user data');
          throw new Error('User not authenticated. Please log in manually.');
        }
      } else {
        console.log('User not authenticated - manual login required');
        throw new Error('User not authenticated. Please log in manually.');
      }
    } else if (mode === 'offline') {
      this.authStrategy = this.offlineAuth;
      this.apiStrategy = this.localStorageApi;
      this.offlineAuth.initialize(); // init here, so we don't login by accident
      await this.offlineAuth.login();
      this.user = await this.waitForLogin();

      if (!this.user) {
        throw new Error('Login failed or user not authenticated.');
      } else {
        console.log('Offline User ID: ' + this.user.uid);
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
      console.log('Waiting for authentication to complete...');
      const timeout = setTimeout(() => {
        console.error('Authentication timeout reached - no user authenticated within 10 seconds');
        reject('Login timed out');
      }, 10000); // 10 seconds timeout.

      const subscription = this.authStrategy.getCurrentUser().subscribe((user) => {
        console.log('Authentication state changed:', user ? `User logged in: ${user.uid}` : 'User is null/logged out');
        if (user) {
          console.log('Authentication successful, resolving promise');
          clearTimeout(timeout);
          subscription.unsubscribe();
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
