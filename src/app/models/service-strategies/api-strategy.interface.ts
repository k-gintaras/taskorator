import { TaskApiStrategy } from './task-strategy.interface';
import { SettingsApiStrategy } from './settings-strategy.interface';
import { ScoreApiStrategy } from './score-strategy.interface copy';
import { TreeApiStrategy } from './tree-strategy.interface';
import { RegisterUserResult, TaskUserInfo } from './user';
import { Score } from '../score';
import { TaskSettings } from '../settings';
import { Task } from '../taskModelManager';
import { TaskTree } from '../taskTree';
import { TaskListApiStrategy } from './task-list-strategy.interface';
import { RegistrationApiStrategy } from './registration-strategy';

// TODO: might wanna add SKIN strategy so people can have color scheme and styles... (purchase probably)
export interface ApiStrategy
  extends TaskApiStrategy, // using different duo to that it needs user ID
    TreeApiStrategy,
    SettingsApiStrategy,
    ScoreApiStrategy,
    TaskListApiStrategy,
    RegistrationApiStrategy {
  // might have special unique methods later on in life
}
