import { Injectable } from '@angular/core';
import { TaskSettings } from '../../models/settings';
import { SettingsCacheStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { AuthService } from '../core/auth.service';
import { AuthOfflineService } from '../core/auth-offline.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsCacheService implements SettingsCacheStrategy {
  private readonly STORAGE_KEY_PREFIX = 'taskorator-settings-cache';
  private readonly LEGACY_STORAGE_KEY = 'taskorator-settings-cache';
  private cache: { settings: TaskSettings; timestamp: number } | null = null;
  private loadedKey: string | null = null;

  constructor(
    private authService: AuthService,
    private authOfflineService: AuthOfflineService
  ) {}

  private getStorageKey(): string {
    const onlineUserId = this.authService.getCurrentUserIdSync();
    if (onlineUserId) {
      return `${this.STORAGE_KEY_PREFIX}:online:${onlineUserId}`;
    }

    const offlineUserId = this.authOfflineService.getCurrentUserIdSync();
    if (offlineUserId) {
      return `${this.STORAGE_KEY_PREFIX}:offline:${offlineUserId}`;
    }

    return this.LEGACY_STORAGE_KEY;
  }

  private loadCacheForKey(storageKey: string): void {
    this.cache = null;
    this.loadedKey = storageKey;

    try {
      const scoped = localStorage.getItem(storageKey);
      if (scoped) {
        this.cache = JSON.parse(scoped) as {
          settings: TaskSettings;
          timestamp: number;
        };
        return;
      }

      if (storageKey !== this.LEGACY_STORAGE_KEY) {
        const legacy = localStorage.getItem(this.LEGACY_STORAGE_KEY);
        if (legacy) {
          this.cache = JSON.parse(legacy) as {
            settings: TaskSettings;
            timestamp: number;
          };
          localStorage.setItem(storageKey, legacy);
        }
      }
    } catch {}
  }

  createSettings(settings: TaskSettings): void {
    this.addSettings(settings);
  }

  /**
   * Add settings to the cache with a timestamp.
   */
  private addSettings(settings: TaskSettings): void {
    const timestamp = Date.now();
    this.cache = { settings, timestamp };
    const storageKey = this.getStorageKey();
    this.loadedKey = storageKey;
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.cache));
    } catch {}
  }

  /**
   * Settings are small and user-critical, so this cache is durable and does not expire.
   */
  getSettings(): TaskSettings | null {
    const storageKey = this.getStorageKey();
    if (!this.cache || this.loadedKey !== storageKey) {
      this.loadCacheForKey(storageKey);
    }

    return this.cache?.settings ?? null;
  }

  /**
   * Update the settings in the cache.
   */
  updateSettings(settings: TaskSettings): void {
    this.addSettings(settings);
  }

  /**
   * Clear only the in-memory settings cache.
   * Persistent per-user settings stay in localStorage so mobile/offline sessions do not lose focus/frog/favorites.
   */
  clearCache(): void {
    this.cache = null;
    this.loadedKey = null;
  }
}
