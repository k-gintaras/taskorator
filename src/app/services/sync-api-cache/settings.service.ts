import { Injectable } from '@angular/core';
import { SettingsStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { BehaviorSubject } from 'rxjs';
import { TaskSettings, getDefaultTaskSettings } from '../../models/settings';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ErrorService } from '../core/error.service';
/**
 * @deprecated TODO: probably not deprecated :DDDDDDDDDDDDDDDDDDDDDDDDDDDDD
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService implements SettingsStrategy {
  private settingsSubject: BehaviorSubject<TaskSettings | null> =
    new BehaviorSubject<TaskSettings | null>(null);
  apiService: ApiStrategy | null = null;

  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
  }

  private ensureApiService(): ApiStrategy {
    if (!this.apiService) {
      throw new Error('API service is not initialized.');
    }
    return this.apiService;
  }

  constructor(
    private cacheService: CacheOrchestratorService,
    private errorService: ErrorService
  ) {}

  async createSettings(settings: TaskSettings): Promise<TaskSettings> {
    try {
      // Persist to API if initialized
      if (this.apiService) {
        try {
          await this.apiService.createSettings(settings);
        } catch (err) {
          console.warn('SettingsService: API createSettings failed, using cache', err);
        }
      }
      await this.cacheService.createSettings(settings);
      this.settingsSubject.next(settings);
      return settings;
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  getSettings(): BehaviorSubject<TaskSettings | null> {
    if (this.settingsSubject.value === null) {
      this.fetchSettings();
    }
    return this.settingsSubject;
  }

  async fetchSettings(): Promise<void> {
    try {
      let settings = await this.cacheService.getSettings();
      // Try remote API only if initialized
      if (!settings && this.apiService) {
        try {
          settings = await this.apiService.getSettings();
        } catch (err) {
          console.warn('SettingsService: API getSettings failed, using cache/default', err);
        }
      }
      if (!settings) {
        // No settings found or API unavailable, use default
        const defaultSettings = getDefaultTaskSettings();
        // Persist to cache and API if available
        await this.cacheService.createSettings(defaultSettings);
        if (this.apiService) {
          try { await this.apiService.createSettings(defaultSettings); } catch {}
        }
        settings = defaultSettings;
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
      // Update API if initialized
      if (this.apiService) {
        try {
          await this.apiService.updateSettings(settings);
        } catch (err) {
          console.warn('SettingsService: API updateSettings failed, using cache', err);
        }
      }
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
      // 1) Try cache first
      let settings = await this.cacheService.getSettings();

      // 2) If not in cache, try API only if initialized
      if (!settings && this.apiService) {
        try {
          settings = await this.apiService.getSettings();
          if (settings) {
            // Update cache with fetched settings
            await this.cacheService.updateSettings(settings);
          }
        } catch (err) {
          console.warn('SettingsService: API getSettingsOnce failed, using cache/default', err);
        }
      }

      // 3) If still not found, return defaults and persist to cache (and API if available)
      if (!settings) {
        settings = getDefaultTaskSettings();
        await this.cacheService.createSettings(settings);
        if (this.apiService) {
          try { await this.apiService.createSettings(settings); } catch {}
        }
      }

      return settings;
    } catch (error) {
      this.error(error);
      // Last resort
      return getDefaultTaskSettings();
    }
  }

  error(msg: unknown) {
    this.errorService.error(msg);
  }
}
