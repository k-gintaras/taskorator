import { Injectable } from '@angular/core';
import { ScoreStrategy } from '../../models/service-strategies/score-strategy.interface copy';
import { BehaviorSubject } from 'rxjs';
import { Score, getDefaultScore } from '../../models/score';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from '../core/cache-orchestrator.service';
import { ErrorService } from '../core/error.service';
/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root',
})
export class ScoreService implements ScoreStrategy {
  private scoreSubject: BehaviorSubject<Score | null> =
    new BehaviorSubject<Score | null>(null);

  apiService: ApiStrategy | null = null;
  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    console.log('ScoreService initialized with API strategy');
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

  async createScore(score: Score): Promise<Score> {
    try {
      await this.ensureApiService().createScore(score);
      this.cacheService.createScore(score);
      this.scoreSubject.next(score);
      return score;
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  getScore(): BehaviorSubject<Score | null> {
    if (this.scoreSubject.value === null) {
      this.fetchScore();
    }
    return this.scoreSubject;
  }

  async fetchScore(): Promise<void> {
    try {
      let score = await this.cacheService.getScore();
      if (!score) {
        score = await this.ensureApiService().getScore();
        if (!score) {
          // Assume a default score; create it as appropriate for your application
          const defaultScore = getDefaultScore(); // Assuming default score is 0, adjust as necessary
          await this.createScore(defaultScore); // Assuming createScore method exists
          score = defaultScore;
        }
        this.cacheService.updateScore(score);
      }
      this.scoreSubject.next(score);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  async updateScore(score: Score): Promise<void> {
    try {
      await this.ensureApiService().updateScore(score);
      this.cacheService.updateScore(score);
      this.scoreSubject.next(score);
    } catch (error) {
      this.error(error);
      throw error;
    }
  }

  private error(msg: unknown) {
    this.errorService.error(msg);
  }
}
