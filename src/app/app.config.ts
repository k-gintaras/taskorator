import { ApplicationConfig } from '@angular/core';

// we kinda import them elsewhere in main
export const appConfig: ApplicationConfig = {
  providers: [],
  // providers: [provideRouter(routes)],
};

export const OTHER_CONFIG = {
  APP_TITLE: 'taskorator',
  REPAIR_TREE: true,
  TREE_UPDATE_FREQUENCY: 500,
  OFFLINE_USER_LOGIN_ID: 'OfflineLoginUserId3',
  OFFLINE_USER_ID: 'OfflineUserId3',
};

export const SENSITIVE_CONFIG = {
  gptServiceUrl: 'http://192.168.1.182:3000',
};

export const TASK_CONFIG = {
  TASK_LIST_LIMIT: 30,
  CACHE_EXPIRATION_MS: 60 * 60 * 1000, // 60 minutes for example
};

export const NAVIGATION_CONFIG = {
  ON_LOGIN_ROUTE_URL: 'sentinel',
};
