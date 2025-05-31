import { ScoreCacheStrategy } from './score-strategy.interface copy';
import { SettingsCacheStrategy } from './settings-strategy.interface';
import { TaskCacheStrategy } from './task-strategy.interface';
import { TreeCacheStrategy } from './tree-strategy.interface';

export interface CacheStrategy
  extends TaskCacheStrategy,
    TreeCacheStrategy,
    SettingsCacheStrategy,
    ScoreCacheStrategy {
  clearCache(): void;
}
