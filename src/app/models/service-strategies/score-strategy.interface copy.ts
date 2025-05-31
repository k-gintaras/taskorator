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
  createScore(score: Score): Promise<Score | null>;
  getScore(): Promise<Score | null>;
  updateScore(score: Score): Promise<void>;
}
