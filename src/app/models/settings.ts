import { ROOT_TASK_NAME } from './taskModelManager';

export interface Settings {
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
  const settings: Settings = {
    isShowArchived: false,
    isShowCompleted: false,
    isShowSeen: true,
    isShowDeleted: false,
    isShowTodo: true,
    completeButtonAction: 'completed',
    lastOverlordViewId: ROOT_TASK_NAME, // the base overlord for all tasks forever
  };
  return { ...settings };
}

export type CompleteButtonAction =
  | 'completed'
  | 'seen'
  | 'todo'
  | 'archived'
  | 'deleted'; // refresh will clear the "removed" status

export function getButtonName(actionName: CompleteButtonAction) {
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
