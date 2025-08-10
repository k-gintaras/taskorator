import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { ApiStrategy } from '../models/service-strategies/api-strategy.interface';
import {
  AuthStrategy,
  AuthUser,
} from '../models/service-strategies/auth-strategy.interface';
import { AuthService } from './core/auth.service';
import { ApiFirebaseService } from './core/api-firebase.service';
// Removed FirebaseApiHelperService: using AuthService directly
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
import { TestDataInitializerService } from '../test-files/test-services/test-data-initializer.service';
import { TaskInitializerService } from './core/task-initializer.service';
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
  private testUserIdSet = false; // 🧪 Flag to prevent multiple ID modifications

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
    private navigationService: NavigationService,
    private testDataInitializer: TestDataInitializerService,
    private taskInitializer: TaskInitializerService
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

    const isOfflineMode = OTHER_CONFIG.OFFLINE_TESTING;
    if (isOfflineMode) {
      mode = 'offline';
      // Offline mode enabled: decide between test profile and real offline flow
      if (OTHER_CONFIG.TEST_DATA_MODE && OTHER_CONFIG.TEST_USER_PROFILE && !this.testUserIdSet) {
        // 🧪 Test profile override: append profile to user IDs (only once)
        const originalUserId = OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
        const testUserId = `${originalUserId}-${OTHER_CONFIG.TEST_USER_PROFILE}`;
        OTHER_CONFIG.OFFLINE_USER_LOGIN_ID = testUserId;
        OTHER_CONFIG.OFFLINE_USER_ID = testUserId;
        this.testUserIdSet = true;
        console.log(`🧪 Using test profile user ID: ${testUserId}`);
      } else if (!OTHER_CONFIG.TEST_DATA_MODE) {
        // 🔧 Real offline user flow: no test data, acts like new user registration
        console.log('🔧 Offline mode with real user flow (TEST_DATA_MODE disabled)');
      }
    }

    if (mode === 'online') {
      // Use AuthService (compat) and ApiFirebaseService directly
      this.authStrategy = this.firebaseAuth;
      this.apiStrategy = this.firebaseApi;
      console.log('🔥 Using AuthService and ApiFirebaseService for online mode');

      // Wait for Firebase auth state to settle before checking authentication
      console.log('Waiting for Firebase auth state to settle...');
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('Auth state check timeout - proceeding anyway');
          resolve();
        }, 5000); // Increased timeout to 5 seconds

        let settled = false;
        let subscription: any;
        subscription = this.authStrategy.getCurrentUser().subscribe((user) => {
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
      if (this.authStrategy.isAuthenticated()) {
        console.log('User already authenticated');
        const currentUser = await this.authStrategy.getCurrentUser().pipe(take(1)).toPromise();
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
      this.offlineAuth.initialize();
      
      try {
        // Login offline and detect new user
        const { isNewUser, userId } = await this.offlineAuth.login();
        this.user = await this.waitForLogin();
        // Persist offline user state
        localStorage.setItem(
          OTHER_CONFIG.OFFLINE_USER_ID,
          JSON.stringify(this.user)
        );
        if (!this.user) {
          throw new Error('Offline login failed or user not authenticated.');
        }
        console.log('Offline User ID:', this.user.uid);
        // Seed data for first-time offline users
        if (isNewUser) {
          if (OTHER_CONFIG.TEST_DATA_MODE) {
            console.log('🧪 Initializing test data for new offline user');
            this.testDataInitializer.clearTestData();
            await this.testDataInitializer.initializeTestData();
          } else {
            console.log('🔧 Registering offline user data for new user');
            const seeded = await this.taskInitializer.registerOfflineUser(
              this.apiStrategy,
              this.registrationService
            );
            if (seeded) {
              console.log('🔧 Offline user tasks and data created');
            } else {
              console.error('🔧 Offline user data seeding failed');
            }
          }
        }
      } catch (error) {
        console.error('Offline authentication failed:', error);
        // Fallback for offline auth failure
        if (!this.user) {
          this.user = {
            uid: 'offline-fallback-user',
            displayName: 'Offline User',
            email: null,
            isAnonymous: true,
            emailVerified: false,
            isNewUser: true,
          };
          console.log('🚨 Using fallback offline user due to auth error');
        }
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

  private async initializeServices(): Promise<void> {
    // Initialize test data for current profile (always refresh to ensure correct data)
    if (OTHER_CONFIG.TEST_DATA_MODE && OTHER_CONFIG.OFFLINE_TESTING) {
      console.log('🧪 Reinitializing test data for profile:', OTHER_CONFIG.TEST_USER_PROFILE);
      // Clear any existing test data for current user
      this.testDataInitializer.clearTestData();
      // Populate fresh test data
      await this.testDataInitializer.initializeTestData();
      // Debug: Check tasks loaded
      const loadedTasks = await this.apiStrategy.getLatestCreatedTasks();
      console.log(`🧪 Debug: Loaded ${loadedTasks?.length || 0} test tasks`);
    }

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
      
      // Shorter timeout for offline mode
      const timeoutDuration = this.sessionType === 'offline' ? 3000 : 10000;
      const timeout = setTimeout(() => {
        console.error(`Authentication timeout reached - no user authenticated within ${timeoutDuration}ms`);
        reject('Login timed out');
      }, timeoutDuration);

      // Use take(1) to auto-unsubscribe after first emission
      this.authStrategy.getCurrentUser()
        .pipe(take(1))
        .subscribe(
          (user) => {
            console.log(
              'Authentication state changed:',
              user ? `User logged in: ${user.uid}` : 'User is null/logged out'
            );
            if (user) {
              console.log('Authentication successful, resolving promise');
              clearTimeout(timeout);
              resolve(user);
            }
          },
          (err) => {
            clearTimeout(timeout);
            reject(err);
          }
        );
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

  /**
   * Clear test data from localStorage (useful for testing)
   */
  clearTestData(): void {
    this.testDataInitializer.clearTestData();
  }

  /**
   * Reinitialize test data (useful for testing)
   */
  async reinitializeTestData(): Promise<void> {
    if (OTHER_CONFIG.TEST_DATA_MODE && OTHER_CONFIG.OFFLINE_TESTING) {
      this.testDataInitializer.clearTestData();
      await this.testDataInitializer.initializeTestData();
      console.log('🧪 Test data reinitialized');
    } else {
      console.log('🧪 Test data reinitialization skipped - not in test mode');
    }
  }

  /**
   * Switch to a different test profile and reinitialize data
   * Usage: sessionManager.switchTestProfile('basic')
   */
  async switchTestProfile(profile: 'empty' | 'basic' | 'complex' | 'massive'): Promise<void> {
    if (!OTHER_CONFIG.TEST_DATA_MODE || !OTHER_CONFIG.OFFLINE_TESTING) {
      console.log('🧪 Profile switching only available in test mode');
      return;
    }

    console.log(`🧪 Switching to test profile: ${profile}`);
    
    // Reset the test user ID flag and update config
    this.testUserIdSet = false;
    (OTHER_CONFIG as any).TEST_USER_PROFILE = profile;
    
    // Clear old data and create new
    await this.testDataInitializer.initializeTestData();
    
    // You might need to reload the page or reinitialize services
    console.log(`🧪 Switched to ${profile} profile. Consider refreshing the page for full effect.`);
  }

  /**
   * Initialize Firebase helpers only (for login flow)
   * This sets up the helpers without checking authentication status
   */
  async initializeHelpersOnly(mode: 'online' | 'offline'): Promise<void> {
    if (mode === 'online') {
      // No init needed: use AuthService and ApiFirebaseService directly
      this.authStrategy = this.firebaseAuth;
      this.apiStrategy = this.firebaseApi;
      console.log('🔥 Firebase services ready for login flow');
    } else {
      this.authStrategy = this.offlineAuth;
      this.apiStrategy = this.localStorageApi;
      this.offlineAuth.initialize();
      
      console.log('📱 Offline services initialized for login flow');
    }
  }

  /**
   * Reset offline test state (useful for debugging)
   */
  resetTestState(): void {
    this.testUserIdSet = false;
    this.isInitialized = false;
    this.sessionType = null;
    console.log('🧪 Test state reset');
  }

  /**
   * Registers a new online user by creating initial tasks, settings, score, and tree
   */
  async registerOnlineUser(): Promise<boolean> {
    console.log('🔧 Registering data for new online user');
    this.registrationService.initialize(this.firebaseApi);
    const result = await this.registrationService.registerNewUser();
    return result !== null;
  }
  
  /**
   * Registers a new offline user by creating initial tasks, settings, score, and tree
   */
  async registerOfflineUser(): Promise<boolean> {
    console.log('🔧 Registering data for new offline user');
    // If using test data profiles, seed test data instead of real user registration
    if (OTHER_CONFIG.TEST_DATA_MODE) {
      // Apply test profile suffix once so storage keys align
      if (!this.testUserIdSet && OTHER_CONFIG.TEST_USER_PROFILE) {
        const original = OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
        const suffixed = `${original}-${OTHER_CONFIG.TEST_USER_PROFILE}`;
        OTHER_CONFIG.OFFLINE_USER_LOGIN_ID = suffixed;
        OTHER_CONFIG.OFFLINE_USER_ID = suffixed;
        this.testUserIdSet = true;
        // Reinitialize offline auth to pick up new key
        this.offlineAuth.initialize();
        console.log(`🧪 Using test profile user ID: ${suffixed}`);
      }
      console.log('🧪 Test data mode enabled - initializing test data for profile');
      await this.testDataInitializer.initializeTestData();
      return true;
    }
    // Real offline user flow: initialize helpers and register new user data
    await this.initializeHelpersOnly('offline');
    const success = await this.taskInitializer.registerOfflineUser(
      this.apiStrategy,
      this.registrationService
    );
    return success;
  }
}
