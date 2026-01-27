import { Injectable, Inject } from '@angular/core';
import { firstValueFrom, switchMap, of, EMPTY } from 'rxjs';
import { API_STRATEGY, AUTH_STRATEGY } from '../tokens';
import { ApiStrategy } from '../models/service-strategies/api-strategy.interface';
import { AuthStrategy } from '../models/service-strategies/auth-strategy.interface';
import { ModeService } from './mode.service';
import { ConfigService } from './config.service';
import { TaskService } from './sync-api-cache/task.service';
import { TaskListService } from './sync-api-cache/task-list.service';
import { TreeService } from './sync-api-cache/tree.service';
import { TaskBatchService } from './sync-api-cache/task-batch.service';
import { SettingsService } from './sync-api-cache/settings.service';
import { ScoreService } from './sync-api-cache/score.service';
import { RegistrationService } from './core/registration.service';
import { TestDataInitializerService } from '../test-files/test-services/test-data-initializer.service';
import { TaskInitializerService } from './core/task-initializer.service';

@Injectable({ providedIn: 'root' })
export class SessionManagerService {
  user: any = null;

  constructor(
    @Inject(AUTH_STRATEGY) private auth: AuthStrategy,
    @Inject(API_STRATEGY) private api: ApiStrategy,
    private modeService: ModeService,
    private config: ConfigService,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private treeService: TreeService,
    private taskBatch: TaskBatchService,
    private settingsService: SettingsService,
    private scoreService: ScoreService,
    private registrationService: RegistrationService,
    private testDataInitializer: TestDataInitializerService,
    private taskInitializer: TaskInitializerService,
  ) {}

  async initialize(mode?: 'online'|'offline'): Promise<void> {
    // ignore mode param, actual mode from ModeService
    const actualMode = this.modeService.get();
    console.log('SessionManager: Initializing with mode:', actualMode);

    if (actualMode === 'online') {
      console.log('SessionManager: Online mode - waiting for auth state');
      // Wait for first non-null user (auth state to settle after login)
      const user = await firstValueFrom(
        this.auth.getCurrentUser().pipe(
          // Skip null values, take first user
          switchMap((user) => user ? of(user) : EMPTY)
        )
      );
      console.log('SessionManager: Current user:', user);
      this.user = user;
      
      // DISABLED: Fire and forget AI API login for online mode - requires deployed AI API backend
      // console.log('SessionManager: Initiating AI API login');
      // this.aiApiFirebase.loginGoogle();
    } else {
      console.log('SessionManager: Offline mode - logging in');
      await this.auth.login();
      this.user = await firstValueFrom(this.auth.getCurrentUser());
      if (!this.user) {
        throw new Error('Offline login failed');
      }
      if (this.config.testDataMode) {
        await this.testDataInitializer.initializeTestData();
      } else {
        await this.taskInitializer.registerOfflineUser(this.api, this.registrationService);
      }
    }

    // initialize downstream services
    console.log('SessionManager: Initializing downstream services');
    this.taskService.initialize(this.api);
    this.settingsService.initialize(this.api);
    this.scoreService.initialize(this.api);
    this.taskListService.initialize(this.api);
    this.treeService.initialize(this.api);
    this.registrationService.initialize(this.api);
    this.taskBatch.initialize(this.api);

    // Preload settings to ensure focus tasks and other settings-based features work immediately
    console.log('SessionManager: Preloading settings');
    await this.settingsService.fetchSettings();
  }

  /** Compatibility: no-op since APP_INITIALIZER runs init */
  waitForInitialization(): Promise<void> {
    return Promise.resolve();
  }

  /** Expose underlying API strategy */
  getApiStrategy(): ApiStrategy {
    return this.api;
  }

  /** Expose underlying Auth strategy */
  getAuthStrategy(): AuthStrategy {
    return this.auth;
  }


  /** Legacy: register online user via RegistrationService */
  async registerOnlineUser(): Promise<boolean> {
    const result = await this.registrationService.registerNewUser();
    return result != null;
  }

  /** Legacy: register offline user via TaskInitializerService */
  async registerOfflineUser(): Promise<boolean> {
    return this.taskInitializer.registerOfflineUser(this.api, this.registrationService);
  }

  /** Get the current session type (online/offline) */
  getSessionType(): 'online' | 'offline' {
    return this.modeService.get();
  }
}

