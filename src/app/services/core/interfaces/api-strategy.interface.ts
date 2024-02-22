import { TaskManagementApiStrategy } from './task-management-strategy.interface';
import { SettingsApiStrategy } from './settings-strategy.interface';
import { ScoreApiStrategy } from './score-strategy.interface copy';
import { TreeApiStrategy } from './tree-strategy.interface';

// TODO: might wanna add SKIN strategy so people can have color scheme and styles... (purchase probably)
export interface ApiStrategy
  extends TaskManagementApiStrategy, // using different duo to that it needs user ID
    TreeApiStrategy,
    SettingsApiStrategy,
    ScoreApiStrategy {
  // might have special unique methods later on in life
}
