import { Observable } from 'rxjs';
import { Score } from '../score';

export interface ScoreStrategy {
  createScore(score: Score): Promise<Score | null>;
  getScore(): Observable<Score | null>;
  updateScore(score: Score): Promise<void>;
}
export interface ScoreCacheStrategy {
  createScore(score: Score): void;
  getScore(): Promise<Score | null> | Score | null;
  updateScore(score: Score): void;
}
export interface ScoreApiStrategy {
  createScore(userId: string, score: Score): Promise<Score | null>;
  getScore(userId: string): Promise<Score | null>;
  updateScore(userId: string, score: Score): Promise<void>;
}
