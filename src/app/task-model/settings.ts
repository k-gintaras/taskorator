export interface Settings {
  isShowArchived: boolean;
  isShowCompleted: boolean;
  completeButtonAction: CompleteButtonAction;
  // ... more settings here
}

export function getDefaultSettings() {
  const settings: Settings = {
    isShowArchived: false,
    isShowCompleted: false,
    completeButtonAction: 'complete',
  };
  return { ...settings };
}

export type CompleteButtonAction =
  | 'complete'
  | 'archive'
  | 'delete'
  | 'refresh'; // refresh will clear the "removed" status
