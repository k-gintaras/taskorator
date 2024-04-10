import { Injectable } from '@angular/core';
import { SettingsStrategy } from './interfaces/settings-strategy.interface';
import { Settings } from 'src/app/models/settings';
import { ConfigService } from './config.service';
import { CoreService } from './core.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService extends CoreService implements SettingsStrategy {
  private settingsSubject: BehaviorSubject<Settings | null> =
    new BehaviorSubject<Settings | null>(null);

  constructor(configService: ConfigService) {
    super(configService);
  }

  async createSettings(settings: Settings): Promise<Settings> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      await this.apiService.createSettings(userId, settings);
      await this.cacheService.createSettings(settings);
      this.settingsSubject.next(settings);
      return settings;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  getSettings(): BehaviorSubject<Settings | null> {
    if (
      this.settingsSubject.value === null &&
      this.authService.isAuthenticated()
    ) {
      this.fetchSettings();
    }
    return this.settingsSubject;
  }

  async fetchSettings(): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      let settings = await this.cacheService.getSettings();
      if (!settings) {
        settings = await this.apiService.getSettings(userId);
        if (!settings) {
          throw new Error('No settings found');
        }
        this.cacheService.updateSettings(settings);
      }
      this.settingsSubject.next(settings);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateSettings(settings: Settings): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      await this.apiService.updateSettings(userId, settings);
      this.cacheService.updateSettings(settings);
      this.settingsSubject.next(settings);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
