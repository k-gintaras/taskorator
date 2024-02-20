import { ApiStrategy } from './api-strategy.interface';
import { AuthStrategy } from './auth-strategy.interface';
import { CacheStrategy } from './cache-strategy.interface';
import { ErrorHandlingStrategy } from './error-handling-strategy.interface';

export interface ConfigStrategy {
  getAuthStrategy: () => AuthStrategy;
  getCacheStrategy: () => CacheStrategy;
  getApiStrategy: () => ApiStrategy;
  getErrorHandlingStrategy: () => ErrorHandlingStrategy;
}
