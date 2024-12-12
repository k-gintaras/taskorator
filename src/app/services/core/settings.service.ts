import { Injectable } from '@angular/core';
import { SettingsStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { ConfigService } from './config.service';
import { CoreService } from './core.service';
import { BehaviorSubject } from 'rxjs';
import { TaskSettings, getDefaultTaskSettings } from '../../models/settings';
/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService extends CoreService implements SettingsStrategy {
  private settingsSubject: BehaviorSubject<TaskSettings | null> =
    new BehaviorSubject<TaskSettings | null>(null);

  constructor(configService: ConfigService) {
    super(configService);
  }

  async createSettings(settings: TaskSettings): Promise<TaskSettings> {
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
      this.error(error);
      throw error;
    }
  }

  getSettings(): BehaviorSubject<TaskSettings | null> {
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
      if (!userId) throw new Error('Not logged in');

      let settings = await this.cacheService.getSettings();
      if (!settings) {
        settings = await this.apiService.getSettings(userId);
        if (!settings) {
          // Settings not found or error occurred
          const defaultSettings = getDefaultTaskSettings(); // Assume some default settings exist
          this.log('recreating settings:');

          await this.createSettings(defaultSettings);
          settings = defaultSettings;
        }
      }
      this.cacheService.updateSettings(settings);
      this.settingsSubject.next(settings);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  async updateSettings(settings: TaskSettings): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      await this.apiService.updateSettings(userId, settings);
      this.cacheService.updateSettings(settings);
      this.settingsSubject.next(settings);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  // New method to get settings once from cache or API
  async getSettingsOnce(): Promise<TaskSettings | null> {
    try {
      let settings = await this.cacheService.getSettings();
      if (!settings) {
        const userId = await this.authService.getCurrentUserId();
        if (!userId) return null;

        settings = await this.apiService.getSettings(userId);
        if (!settings) return null;

        // Optionally update the cache with the fetched settings
        await this.cacheService.updateSettings(settings);
      }
      return settings;
    } catch (error) {
      this.error(error);
      return null;
    }
  }
}
