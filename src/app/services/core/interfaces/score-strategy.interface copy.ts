import { Score } from 'src/app/models/score';

export interface ScoreStrategy {
  createScore(score: Score): Promise<Score | null>;
  getScore(): Promise<Score | null>;
  updateScore(score: Score): Promise<void>;
}
export interface ScoreApiStrategy {
  createScore(userId: string, score: Score): Promise<Score | null>;
  getScore(userId: string): Promise<Score | null>;
  updateScore(userId: string, score: Score): Promise<void>;
}
