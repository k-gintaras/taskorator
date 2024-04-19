import { ScoreCacheStrategy } from './score-strategy.interface copy';
import { SettingsCacheStrategy } from './settings-strategy.interface';
import { TaskManagementCacheStrategy } from './task-management-strategy.interface';
import { TreeCacheStrategy } from './tree-strategy.interface';

export interface CacheStrategy
  extends TaskManagementCacheStrategy,
    TreeCacheStrategy,
    SettingsCacheStrategy,
    ScoreCacheStrategy {
  clearCache(): void;
}
