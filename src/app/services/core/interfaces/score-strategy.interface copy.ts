import { Score } from 'src/app/models/score';

export interface ScoreStrategy {
  createScore(settings: Score): Promise<Score>;
  getScore(): Promise<Score>;
  updateScore(settings: Score): Promise<void>;
  // might have special unique methods later on in life
}
