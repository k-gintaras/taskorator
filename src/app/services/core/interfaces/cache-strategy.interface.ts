import { ScoreStrategy } from './score-strategy.interface copy';
import { SettingsStrategy } from './settings-strategy.interface';
import { TaskManagementStrategy } from './task-management-strategy.interface';
import { TreeStrategy } from './tree-strategy.interface';

export interface CacheStrategy
  extends TaskManagementStrategy,
    TreeStrategy,
    SettingsStrategy,
    ScoreStrategy {}
