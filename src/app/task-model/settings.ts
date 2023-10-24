export interface Settings {
  isShowArchived: boolean;
  isShowCompleted: boolean;
  // ... more settings here
}

export function getDefaultSettings() {
  const settings: Settings = {
    isShowArchived: false,
    isShowCompleted: false,
  };
  return { ...settings };
}
