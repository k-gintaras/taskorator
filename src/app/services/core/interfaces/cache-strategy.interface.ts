import { Task } from 'src/app/models/taskModelManager';
import { ScoreCacheStrategy } from './score-strategy.interface copy';
import { SettingsCacheStrategy } from './settings-strategy.interface';
import { TaskManagementCacheStrategy } from './task-management-strategy.interface';
import { TreeCacheStrategy } from './tree-strategy.interface';
import { Settings } from 'src/app/models/settings';
import { Score } from 'src/app/models/score';
import { TaskTree } from 'src/app/models/taskTree';
import { RegisterUserResult } from './register-user';

export interface CacheStrategy
  extends TaskManagementCacheStrategy,
    TreeCacheStrategy,
    SettingsCacheStrategy,
    ScoreCacheStrategy {
  clearCache(): void;
  // register(
  //   userId: string,
  //   initialTask: Task,
  //   additionalTasks: Task[],
  //   settings: Settings,
  //   score: Score,
  //   tree: TaskTree
  // ): Promise<RegisterUserResult>;

  // getCacheTasks(taskId: string): Observable<Task[] | Task | undefined>;
  // addCacheTasks(taskId: string, tasks: Task[]): void;
  // addCacheTask(task: Task): void;
}
