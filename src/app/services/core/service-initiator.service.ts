import { Injectable } from '@angular/core';
import { ScoreService } from './score.service';
import { TreeService } from './tree.service';
import { ApiStrategy } from './interfaces/api-strategy.interface';
import { AuthStrategy } from './interfaces/auth-strategy.interface';
import { CacheStrategy } from './interfaces/cache-strategy.interface';
import { TestApiService } from '../test/test-api.service';
import { TestAuthService } from '../test/test-auth.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ErrorService } from './error.service';
import ApiService from './api.service';
import { ConfigService } from './config.service';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';

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
