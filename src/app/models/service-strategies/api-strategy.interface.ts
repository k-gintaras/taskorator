import { TaskManagementApiStrategy } from './task-management-strategy.interface';
import { SettingsApiStrategy } from './settings-strategy.interface';
import { ScoreApiStrategy } from './score-strategy.interface copy';
import { TreeApiStrategy } from './tree-strategy.interface';
import { RegisterUserResult, TaskUserInfo } from './user';
import { Score } from '../score';
import { TaskSettings } from '../settings';
import { Task } from '../taskModelManager';
import { TaskTree } from '../taskTree';

// TODO: might wanna add SKIN strategy so people can have color scheme and styles... (purchase probably)
export interface ApiStrategy
  extends TaskManagementApiStrategy, // using different duo to that it needs user ID
    TreeApiStrategy,
    SettingsApiStrategy,
    ScoreApiStrategy {
  generateApiKey(userId: string): Promise<string | undefined>;
  register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: TaskSettings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult>;
  getUserInfo(userId: string): Promise<TaskUserInfo | undefined>; // the user might not exist
  // might have special unique methods later on in life
}
