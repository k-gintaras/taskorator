import { ApplicationConfig } from '@angular/core';

// we kinda import them elsewhere in main
export const appConfig: ApplicationConfig = {
  providers: [],
  // providers: [provideRouter(routes)],
};

export const SENSITIVE_CONFIG = {
  gptServiceUrl: 'http://192.168.1.182:3000',
};

export const TASK_CONFIG = {
  TASK_LIST_LIMIT: 30,
  CACHE_EXPIRATION_MS: 60 * 60 * 1000, // 60 minutes for example
};
