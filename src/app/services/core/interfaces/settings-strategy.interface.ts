import { Settings } from 'src/app/models/settings';

export interface SettingsStrategy {
  createSettings(settings: Settings): Promise<Settings>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<void>;
}
