import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ApiStrategy } from './interfaces/api-strategy.interface';
import { AuthStrategy } from './interfaces/auth-strategy.interface';
import { CacheStrategy } from './interfaces/cache-strategy.interface';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(protected configService: ConfigService) {}

  protected get cacheService(): CacheStrategy {
    return this.configService.getCacheStrategy();
  }

  protected get apiService(): ApiStrategy {
    return this.configService.getApiStrategy();
  }

  protected get authService(): AuthStrategy {
    return this.configService.getAuthStrategy();
  }

  protected get errorHandlingService(): ErrorHandlingStrategy {
    return this.configService.getErrorHandlingStrategy();
  }

  protected log(message: unknown): void {
    this.errorHandlingService.log(message);
  }

  protected error(message: unknown): void {
    this.errorHandlingService.error(message);
  }

  protected feedback(message: string): void {
    this.errorHandlingService.feedback(message);
  }

  protected popup(message: string): void {
    this.errorHandlingService.popup(message);
  }
}
