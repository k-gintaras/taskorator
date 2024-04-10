import { Injectable } from '@angular/core';
import { ScoreStrategy } from './interfaces/score-strategy.interface copy';
import { Score } from 'src/app/models/score';
import { ConfigService } from './config.service';
import { CoreService } from './core.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScoreService extends CoreService implements ScoreStrategy {
  private scoreSubject: BehaviorSubject<Score | null> =
    new BehaviorSubject<Score | null>(null);

  constructor(configService: ConfigService) {
    super(configService);
  }

  async createScore(score: Score): Promise<Score> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      await this.apiService.createScore(userId, score);
      await this.cacheService.createScore(score);
      this.scoreSubject.next(score);
      return score;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  getScore(): BehaviorSubject<Score | null> {
    if (
      this.scoreSubject.value === null &&
      this.authService.isAuthenticated()
    ) {
      this.fetchScore();
    }
    return this.scoreSubject;
  }

  async fetchScore(): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      let score = await this.cacheService.getScore();
      if (!score) {
        score = await this.apiService.getScore(userId);
        if (!score) {
          throw new Error('No score found');
        }
        this.cacheService.updateScore(score);
      }
      this.scoreSubject.next(score);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateScore(score: Score): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('not logged in');
      }
      await this.apiService.updateScore(userId, score);
      this.cacheService.updateScore(score);
      this.scoreSubject.next(score);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
