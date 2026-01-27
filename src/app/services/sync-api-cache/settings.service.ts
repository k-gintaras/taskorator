import { Injectable } from '@angular/core';
import { SettingsStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { BehaviorSubject } from 'rxjs';
import { TaskSettings, getDefaultTaskSettings } from '../../models/settings';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ErrorService } from '../core/error.service';
import { getDefaultTask, ROOT_TASK_ID, TaskoratorTask } from '../../models/taskModelManager';
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
      // Persist to API if available (throws if API not initialized)
      try {
        const api = this.ensureApiService();
        await api.createSettings(settings);
      } catch (err) {
        console.warn('SettingsService: API createSettings failed or unavailable, using cache', err);
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
      if (!settings) {
        try {
          const api = this.ensureApiService();
          settings = await api.getSettings();
        } catch (err) {
          console.warn('SettingsService: API getSettings failed or unavailable, using cache/default', err);
        }
      }
      if (!settings) {
        // No settings found or API unavailable, use default but preserve existing cache if available
        const existingSettings = await this.cacheService.getSettings();
        if (existingSettings) {
          // Preserve existing settings, just update the subject
          settings = existingSettings;
        } else {
          // No existing settings, use defaults
          const defaultSettings = getDefaultTaskSettings();
            // Persist to cache and API if available
            await this.cacheService.createSettings(defaultSettings);
            try { const api = this.ensureApiService(); await api.createSettings(defaultSettings); } catch {}
          settings = defaultSettings;
        }
      }
      // Normalize/merge settings to avoid partial objects wiping arrays
      const normalized = this.normalizeSettings(settings);
      this.cacheService.updateSettings(normalized);
      this.settingsSubject.next(normalized);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  async updateSettings(settings: TaskSettings): Promise<void> {
    try {
      // Update API if available
      try {
        const api = this.ensureApiService();
        await api.updateSettings(settings);
      } catch (err) {
        console.warn('SettingsService: API updateSettings failed or unavailable, using cache', err);
      }
      const normalized = this.normalizeSettings(settings);

      // detect focusTaskIds cleared
      try {
        const prev = this.cacheService.getSettings();
        const prevHasFocus = !!(prev && Array.isArray(prev.focusTaskIds) && prev.focusTaskIds.length > 0);
        const nowHasFocus = !!(normalized && Array.isArray(normalized.focusTaskIds) && normalized.focusTaskIds.length > 0);
        if (prevHasFocus && !nowHasFocus) {
          const msg = `Focus tasks cleared at ${new Date().toISOString()}`;
          console.warn(msg);
          this.errorService.log(msg);

          // create a root task to notify the user
          try {
            const alertTask: TaskoratorTask = getDefaultTask();
            alertTask.taskId = getDefaultTask().taskId + '_' + Date.now().toString(36);
            alertTask.name = '⚠️ Focus tasks were cleared — investigate';
            alertTask.why = `Focus tasks were cleared automatically on ${new Date().toLocaleString()}. If this was unexpected, check synchronization/caching.`;
            alertTask.overlord = ROOT_TASK_ID;
            alertTask.timeCreated = Date.now();
            alertTask.lastUpdated = Date.now();
            // Try to persist via API if available, else update cache
            try { const api = this.ensureApiService(); await api.createTask(alertTask); } catch (e) { console.warn('Failed to create alert task via API', e); this.cacheService.createTask(alertTask); }
          } catch (e) {
            console.warn('Failed to create focus-clear alert task', e);
          }
        }
      } catch (e) {
        console.warn('Error checking previous settings for focusTaskIds', e);
      }

      this.cacheService.updateSettings(normalized);
      this.settingsSubject.next(normalized);
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
      if (!settings) {
        try {
          const api = this.ensureApiService();
          settings = await api.getSettings();
          if (settings) {
            // Update cache with fetched settings
            await this.cacheService.updateSettings(settings);
          }
        } catch (err) {
          console.warn('SettingsService: API getSettingsOnce failed or unavailable, using cache/default', err);
        }
      }

      // 3) If still not found, return defaults and persist to cache (and API if available)
      if (!settings) {
        settings = getDefaultTaskSettings();
        await this.cacheService.createSettings(settings);
        try { const api = this.ensureApiService(); await api.createSettings(settings); } catch {}
      }

      return this.normalizeSettings(settings);
    } catch (error) {
      this.error(error);
      // Last resort
      return getDefaultTaskSettings();
    }
  }

  /**
   * Ensure the settings object has all required fields and sensible defaults.
   * This protects against partial/empty objects coming from cache or API.
   */
  private normalizeSettings(settings: any): TaskSettings {
    const defaults = getDefaultTaskSettings();
    if (!settings || typeof settings !== 'object') {
      return { ...defaults };
    }
    const merged: TaskSettings = { ...defaults, ...settings } as TaskSettings;

    // Ensure arrays are arrays (avoid undefined/null replacing them)
    merged.focusTaskIds = Array.isArray(merged.focusTaskIds) ? merged.focusTaskIds : [];
    merged.frogTaskIds = Array.isArray(merged.frogTaskIds) ? merged.frogTaskIds : [];
    merged.favoriteTaskIds = Array.isArray(merged.favoriteTaskIds) ? merged.favoriteTaskIds : [];

    return merged;
  }

  error(msg: unknown) {
    this.errorService.error(msg);
  }
}
