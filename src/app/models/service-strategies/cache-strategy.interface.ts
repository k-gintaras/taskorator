import { ScoreCacheStrategy } from './score-strategy.interface copy';
import { SettingsCacheStrategy } from './settings-strategy.interface';
import { TaskManagementStrategy } from './task-management-strategy.interface';
import { TreeCacheStrategy } from './tree-strategy.interface';

export interface CacheStrategy
  extends TaskManagementStrategy,
    TreeCacheStrategy,
    SettingsCacheStrategy,
    ScoreCacheStrategy {
  clearCache(): void;
}
