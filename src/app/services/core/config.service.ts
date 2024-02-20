import { Injectable } from '@angular/core';
import { ConfigStrategy } from './interfaces/strategy-config.interface';
import { AuthStrategy } from './interfaces/auth-strategy.interface';
import { CacheStrategy } from './interfaces/cache-strategy.interface';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ApiService } from './api.service';
import { ErrorService } from './error.service';
import { ApiStrategy } from './interfaces/api-strategy.interface';
@Injectable({
  providedIn: 'root',
})
export class ConfigService implements ConfigStrategy {
  constructor(
    private authService: AuthService,
    private cacheService: CacheService,
    private apiService: ApiService,
    private errorService: ErrorService
  ) {}

  getAuthStrategy(): AuthStrategy {
    // Logic to determine which AuthStrategy to use
    return this.authService;
  }

  getCacheStrategy(): CacheStrategy {
    // Logic to determine which CacheStrategy to use
    return this.cacheService;
  }

  getApiStrategy(): ApiStrategy {
    // Logic to determine which TaskStrategy to use
    return this.apiService;
  }

  getErrorHandlingStrategy(): ErrorHandlingStrategy {
    // Logic to determine which ErrorHandlingStrategy to use
    return this.errorService;
  }
}
