import { ListRules } from './task-list';
import { ExtendedTask } from './taskModelManager';

export const LIST_RULES: { [key: string]: ListRules } = {
  latestTasks: {
    filter: (task: ExtendedTask) => task.stage !== 'deleted',
    sorter: (a: ExtendedTask, b: ExtendedTask) => b.lastUpdated - a.lastUpdated,
    permissions: {
      canAdd: false,
      canMove: false,
      canDelete: false,
      canComplete: false,
    },
  },
  focusTasks: {
    filter: (task: ExtendedTask) => task.stage === 'todo',
    sorter: (a: ExtendedTask, b: ExtendedTask) => a.priority - b.priority,
  },
};
