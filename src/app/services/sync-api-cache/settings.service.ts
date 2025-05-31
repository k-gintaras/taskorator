import { Injectable } from '@angular/core';
import { SettingsStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { BehaviorSubject } from 'rxjs';
import { TaskSettings, getDefaultTaskSettings } from '../../models/settings';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ErrorService } from '../core/error.service';
/**
 * @deprecated
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
    console.log('SettingsService initialized with API strategy');
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
      await this.ensureApiService().createSettings(settings);
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
      if (!settings) {
        settings = await this.ensureApiService().getSettings();
        if (!settings) {
          // Settings not found or error occurred
          const defaultSettings = getDefaultTaskSettings(); // Assume some default settings exist

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
      await this.ensureApiService().updateSettings(settings);
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
        settings = await this.ensureApiService().getSettings();
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

  error(msg: unknown) {
    this.errorService.error(msg);
  }
}
