import { TaskManagementStrategy } from './task-management-strategy.interface';
import { TreeStrategy } from './tree-strategy.interface';
import { SettingsStrategy } from './settings-strategy.interface';
import { ScoreStrategy } from './score-strategy.interface copy';

// auth-strategy.interface.ts
export interface ApiStrategy
  extends TaskManagementStrategy,
    TreeStrategy,
    SettingsStrategy,
    ScoreStrategy {
  // might have special unique methods later on in life
}
