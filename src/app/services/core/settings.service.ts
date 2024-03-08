import { Injectable } from '@angular/core';
import { SettingsStrategy } from './interfaces/settings-strategy.interface';
import { Settings } from 'src/app/models/settings';
import { from, switchMap, tap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';
import { EventBusService } from './event-bus.service';
import { LogService } from './log.service';
import ApiService from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService implements SettingsStrategy {
  private authService!: AuthService;
  private cacheService!: CacheService;
  private apiService!: ApiService;
  private errorHandlingService!: ErrorService;

  constructor(
    private configService: ConfigService,
    private logService: LogService
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.authService = this.configService.getAuthStrategy();
    this.cacheService = this.configService.getCacheStrategy();
    this.apiService = this.configService.getApiStrategy();
    this.errorHandlingService = this.configService.getErrorHandlingStrategy();
  }

  async createSettings(settings: Settings): Promise<Settings> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.createSettings(userId, settings);
      await this.cacheService.createSettings(settings);
      return settings;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async getSettings(): Promise<Settings> {
    // TODO: what happens with get settings on change... ?
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      let settings = await this.cacheService.getSettings();
      if (!settings) {
        settings = await this.apiService.getSettings(userId);
        if (!settings) {
          throw new Error('No settings found');
        }
        this.cacheService.updateSettings(settings);
      }
      return settings;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateSettings(settings: Settings): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.updateSettings(userId, settings);
      this.cacheService.updateSettings(settings);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
