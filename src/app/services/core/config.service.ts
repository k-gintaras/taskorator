import { Injectable } from '@angular/core';
import { ConfigStrategy } from '../../models/service-strategies/strategy-config.interface';
import { CacheService } from './cache.service';
import { ErrorService } from './error.service';
import { TestAuthService } from '../test-services/test-auth.service';
import { TestApiService } from '../test-services/test-api.service';
import { AuthStrategy } from '../../models/service-strategies/auth-strategy.interface';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheStrategy } from '../../models/service-strategies/cache-strategy.interface';
import { ErrorHandlingStrategy } from '../../models/service-strategies/error-handling-strategy.interface';
@Injectable({
  providedIn: 'root',
})
export class ConfigService implements ConfigStrategy {
  private repairTreeEnabled = true;
  private testing = true;

  private apiService: ApiStrategy | undefined;
  private authService: AuthStrategy | undefined;
  private cacheService: CacheStrategy | undefined;
  private errorService: ErrorHandlingStrategy | undefined;

  // to return either default or whatever we set it to in service initiator, which initiated in app.component
  constructor(
    private errorServiceDefault: ErrorService,
    private cacheServiceDefault: CacheService,
    private authServiceDefault: TestAuthService,
    private apiServiceDefault: TestApiService
  ) {}

  setApiService(service: ApiStrategy) {
    this.apiService = service;
  }

  setAuthService(service: AuthStrategy) {
    this.authService = service;
  }

  setCacheService(service: CacheStrategy) {
    this.cacheService = service;
  }

  setErrorService(service: ErrorHandlingStrategy) {
    this.errorService = service;
  }

  isTesting(): boolean {
    return this.testing;
  }

  isRepairTreeEnabled(): boolean {
    return this.repairTreeEnabled;
  }

  getAuthStrategy(): AuthStrategy {
    return this.authService || this.authServiceDefault;
  }

  getCacheStrategy(): CacheStrategy {
    return this.cacheService || this.cacheServiceDefault;
  }

  getApiStrategy(): ApiStrategy {
    return this.apiService || this.apiServiceDefault;
  }

  getErrorHandlingStrategy(): ErrorHandlingStrategy {
    return this.errorService || this.errorServiceDefault;
  }
}
