import { Injectable } from '@angular/core';
import { ScoreStrategy } from './interfaces/score-strategy.interface copy';
import { Score } from 'src/app/models/score';
import { EventBusService } from './event-bus.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';
import { LogService } from './log.service';
import ApiService from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ScoreService implements ScoreStrategy {
  private authService!: AuthService;
  private cacheService!: CacheService;
  private apiService!: ApiService;
  private errorHandlingService!: ErrorService;

  constructor(
    private configService: ConfigService,
    private logService: LogService
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.authService = this.configService.getAuthStrategy();
    this.cacheService = this.configService.getCacheStrategy();
    this.apiService = this.configService.getApiStrategy();
    this.errorHandlingService = this.configService.getErrorHandlingStrategy();
  }

  async createScore(score: Score): Promise<Score> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.createScore(userId, score);
      await this.cacheService.createScore(score);
      return score;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async getScore(): Promise<Score> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      let score = await this.cacheService.getScore();
      if (!score) {
        score = await this.apiService.getScore(userId);
        if (!score) {
          throw new Error('No score found');
        }
        this.cacheService.updateScore(score);
      }
      return score;
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }

  async updateScore(score: Score): Promise<void> {
    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error(this.errorHandlingService.ERROR_NOT_LOGGED_IN);
      }

      await this.apiService.updateScore(userId, score);
      this.cacheService.updateScore(score);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      throw error;
    }
  }
}
