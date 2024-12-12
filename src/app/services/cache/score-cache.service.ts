import { Injectable } from '@angular/core';
import { TASK_CONFIG } from '../../app.config';
import { Score } from '../../models/score';

@Injectable({
  providedIn: 'root',
})
export class ScoreCacheService {
  private cache: { score: Score; timestamp: number } | null = null;

  /**
   * Add a score to the cache with a timestamp.
   */
  addScore(score: Score): void {
    const timestamp = Date.now();
    this.cache = { score, timestamp };
  }

  /**
   * Retrieve the score from the cache, removing it if expired.
   */
  getScore(): Score | null {
    if (this.cache) {
      const isExpired =
        Date.now() - this.cache.timestamp > TASK_CONFIG.CACHE_EXPIRATION_MS;
      if (isExpired) {
        this.cache = null; // Clear expired cache
        return null;
      }
      return this.cache.score;
    }
    return null;
  }

  /**
   * Update the score in the cache.
   */
  updateScore(score: Score): void {
    this.addScore(score);
  }

  /**
   * Clear the cached score.
   */
  clearCache(): void {
    this.cache = null;
  }
}
