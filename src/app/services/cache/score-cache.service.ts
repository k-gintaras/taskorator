import { Injectable } from '@angular/core';
import { Score } from '../../models/score';
import { ScoreCacheStrategy } from '../../models/service-strategies/score-strategy.interface copy';
import { AuthService } from '../core/auth.service';
import { AuthOfflineService } from '../core/auth-offline.service';

@Injectable({
  providedIn: 'root',
})
export class ScoreCacheService implements ScoreCacheStrategy {
  private readonly STORAGE_KEY_PREFIX = 'taskorator-score-cache';
  private readonly LEGACY_STORAGE_KEY = 'taskorator-score-cache';
  private cache: { score: Score; timestamp: number } | null = null;
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
          score: Score;
          timestamp: number;
        };
        return;
      }

      if (storageKey !== this.LEGACY_STORAGE_KEY) {
        const legacy = localStorage.getItem(this.LEGACY_STORAGE_KEY);
        if (legacy) {
          this.cache = JSON.parse(legacy) as {
            score: Score;
            timestamp: number;
          };
          localStorage.setItem(storageKey, legacy);
        }
      }
    } catch {}
  }

  createScore(score: Score): void {
    this.addScore(score);
  }

  private addScore(score: Score): void {
    const timestamp = Date.now();
    this.cache = { score, timestamp };
    const storageKey = this.getStorageKey();
    this.loadedKey = storageKey;
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.cache));
    } catch {}
  }

  /**
   * Score is user-specific and should survive reloads/offline transitions.
   * This cache is durable and does not expire automatically.
   */
  getScore(): Score | null {
    const storageKey = this.getStorageKey();
    if (!this.cache || this.loadedKey !== storageKey) {
      this.loadCacheForKey(storageKey);
    }

    return this.cache?.score ?? null;
  }

  updateScore(score: Score): void {
    this.addScore(score);
  }

  clearCache(): void {
    this.cache = null;
    this.loadedKey = null;
  }
}
