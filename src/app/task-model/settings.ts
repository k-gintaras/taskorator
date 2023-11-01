export interface Settings {
  isShowArchived: boolean;
  isShowCompleted: boolean;
  isShowSeen: boolean;
  isShowDeleted: boolean;
  isShowTodo: boolean;
  completeButtonAction: CompleteButtonAction;
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
  };
  return { ...settings };
}

export type CompleteButtonAction =
  | 'completed'
  | 'seen'
  | 'todo'
  | 'archived'
  | 'deleted'; // refresh will clear the "removed" status
