import { ApplicationConfig } from '@angular/core';

// we kinda import them elsewhere in main
export const appConfig: ApplicationConfig = {
  providers: [],
  // providers: [provideRouter(routes)],
};

export const SENSITIVE_CONFIG = {
  gptServiceUrl: 'https://gpt-web-service.onrender.com',
};

export const TASK_CONFIG = {
  TASK_LIST_LIMIT: 30,
  CACHE_EXPIRATION_MS: 5 * 60 * 1000, // 5 minutes for example
};
