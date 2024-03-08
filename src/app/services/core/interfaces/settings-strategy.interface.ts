import { Settings } from 'src/app/models/settings';

export interface SettingsStrategy {
  getSettings(): Promise<Settings | null>;
  updateSettings(settings: Settings): Promise<void>;
}

export interface SettingsApiStrategy {
  getSettings(userId: string): Promise<Settings | null>;
  updateSettings(userId: string, settings: Settings): Promise<void>;
}
