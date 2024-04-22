import { ROOT_TASK_ID } from './taskModelManager';

export interface TaskSettings {
  isShowArchived: boolean;
  isShowCompleted: boolean;
  isShowSeen: boolean;
  isShowDeleted: boolean;
  isShowTodo: boolean;
  completeButtonAction: CompleteButtonAction;
  lastOverlordViewId: string;
  // ... more settings here
}

export function getDefaultSettings() {
  const settings: TaskSettings = {
    isShowArchived: false,
    isShowCompleted: false,
    isShowSeen: true,
    isShowDeleted: false,
    isShowTodo: true,
    completeButtonAction: 'completed',
    lastOverlordViewId: ROOT_TASK_ID, // the base overlord for all tasks forever
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
      return 'check_circle'; // Represents a completed task with a checkmark inside a circle
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
