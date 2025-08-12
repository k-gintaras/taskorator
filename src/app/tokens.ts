import { InjectionToken } from '@angular/core';
import { ApiStrategy } from './models/service-strategies/api-strategy.interface';
import { AuthStrategy } from './models/service-strategies/auth-strategy.interface';

export const API_STRATEGY = new InjectionToken<ApiStrategy>('API_STRATEGY');
export const AUTH_STRATEGY = new InjectionToken<AuthStrategy>('AUTH_STRATEGY');
