import { Injectable } from '@angular/core';
import { ScoreService } from './score.service';
import { TreeService } from './tree.service';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { AuthStrategy } from '../../models/service-strategies/auth-strategy.interface';
// import { CacheStrategy } from '../../models/service-strategies/cache-strategy.interface';
import { TestApiService } from '../test-services/test-api.service';
import { TestAuthService } from '../test-services/test-auth.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ErrorService } from './error.service';
import ApiService from './api.service';
import { ConfigService } from './config.service';
import { ErrorHandlingStrategy } from '../../models/service-strategies/error-handling-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ServiceInitiatorService {
  private isInitialized = false;
  private initializationPromise: Promise<void>;

  constructor(
    private treeService: TreeService,
    private scoreService: ScoreService,
    private authService: AuthService,
    private cacheService: CacheService,
    private apiService: ApiService,
    private errorService: ErrorService,
    private testAuthService: TestAuthService,
    private testApiService: TestApiService,
    private configService: ConfigService
  ) {
    this.initializationPromise = this.initApiServices();
  }

  async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  private async initApiServices(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    let apiService: ApiStrategy = this.apiService;
    let authService: AuthStrategy = this.authService;
    const errorService: ErrorHandlingStrategy = this.errorService;
    // TODO: allow different caching?
    const cacheService = this.cacheService;

    if (this.configService.isTesting()) {
      apiService = this.testApiService;
      authService = this.testAuthService;
    }

    this.configService.setApiService(apiService);
    this.configService.setAuthService(authService);
    this.configService.setCacheService(cacheService);
    this.configService.setErrorService(errorService);

    this.isInitialized = true;
    console.log('Api initialized:');
  }
}
