import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { AuthStrategy } from '../../models/service-strategies/auth-strategy.interface';
import { CacheStrategy } from '../../models/service-strategies/cache-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ServiceLocatorService {
  private apiService: ApiStrategy | undefined;
  private authService: AuthStrategy | undefined;
  private cacheService: CacheStrategy | undefined;

  setApiService(service: ApiStrategy) {
    this.apiService = service;
  }

  setAuthService(service: AuthStrategy) {
    this.authService = service;
  }

  setCacheService(service: CacheStrategy) {
    this.cacheService = service;
  }

  getApiService(): ApiStrategy | undefined {
    return this.apiService;
  }

  getAuthService(): AuthStrategy | undefined {
    return this.authService;
  }

  getCacheService(): CacheStrategy | undefined {
    return this.cacheService;
  }
}
