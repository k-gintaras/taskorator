import { ROOT_TASK_ID } from './taskModelManager';

export interface TaskSettings {
  moveTasksOnce: boolean;
  isShowArchived: boolean;
  isShowCompleted: boolean;
  isShowSeen: boolean;
  isShowDeleted: boolean;
  isShowTodo: boolean; // same as below for now...
  isShowMore: boolean; // task list will show tasks with more details, more than just a name
  isShowCompletedRepeating: boolean; // i.e. if daily task is completed, shall we still show every day
  completeButtonAction: CompleteButtonAction;
  lastOverlordViewId: string;
  focusTaskIds: string[];
  frogTaskIds: string[];
  favoriteTaskIds: string[];
}

export function getDefaultTaskSettings() {
  const settings: TaskSettings = {
    isShowArchived: false,
    isShowCompleted: false,
    isShowSeen: true,
    isShowDeleted: false,
    isShowTodo: true,
    completeButtonAction: 'completed',
    lastOverlordViewId: ROOT_TASK_ID,
    isShowMore: false,
    focusTaskIds: [],
    isShowCompletedRepeating: true,
    frogTaskIds: [],
    favoriteTaskIds: [],
    moveTasksOnce: true,
  };
  return { ...settings };
}

export type CompleteButtonAction =
  | 'completed'
  | 'seen'
  | 'todo'
  | 'archived'
  | 'deleted'; // refresh will clear the "removed" status

export function getButtonTextName(actionName: CompleteButtonAction) {
  switch (actionName) {
    case 'completed':
      return 'Complete';
    case 'seen':
      return 'Seen';
    case 'todo':
      return 'Todo';
    case 'archived':
      return 'Archive';
    case 'deleted':
      return 'Delete';
    default:
      return 'X';
  }
}

export function getButtonMatName(actionName: CompleteButtonAction): string {
  switch (actionName) {
    case 'completed':
      return 'check'; // Represents a completed task with a checkmark inside a circle
    case 'seen':
      return 'visibility'; // Represents marking a task as seen
    case 'todo':
      return 'add_circle_outline'; // Represents adding a task to a todo list
    case 'archived':
      return 'archive'; // Represents archiving a task
    case 'deleted':
      return 'delete'; // Represents deleting a task
    default:
      return 'error_outline'; // Fallback icon indicating an unrecognized action
  }
}
