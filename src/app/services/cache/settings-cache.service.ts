import { Injectable } from '@angular/core';
import { TASK_CONFIG } from '../../app.config';
import { TaskSettings } from '../../models/settings';
import { SettingsCacheStrategy } from '../../models/service-strategies/settings-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsCacheService implements SettingsCacheStrategy {
  private cache: { settings: TaskSettings; timestamp: number } | null = null;

  createSettings(settings: TaskSettings): void {
    this.addSettings(settings);
  }
  /**
   * Add settings to the cache with a timestamp.
   */
  private addSettings(settings: TaskSettings): void {
    const timestamp = Date.now();
    this.cache = { settings, timestamp };
  }

  /**
   * Retrieve the settings from the cache, removing them if expired.
   */
  getSettings(): TaskSettings | null {
    if (this.cache) {
      const isExpired =
        Date.now() - this.cache.timestamp > TASK_CONFIG.CACHE_EXPIRATION_MS;
      if (isExpired) {
        this.cache = null; // Clear expired cache
        return null;
      }
      return this.cache.settings;
    }
    return null;
  }

  /**
   * Update the settings in the cache.
   */
  updateSettings(settings: TaskSettings): void {
    this.addSettings(settings);
  }

  /**
   * Clear the cached settings.
   */
  clearCache(): void {
    this.cache = null;
  }
}
