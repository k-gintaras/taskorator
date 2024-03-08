import { Score } from 'src/app/models/score';

export interface ScoreStrategy {
  getScore(): Promise<Score | null>;
  updateScore(score: Score): Promise<void>;
}
export interface ScoreApiStrategy {
  getScore(userId: string): Promise<Score | null>;
  updateScore(userId: string, score: Score): Promise<void>;
}
