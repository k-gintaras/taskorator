import { Observable } from 'rxjs';
import { Settings } from 'src/app/models/settings';

export interface SettingsStrategy {
  createSettings(settings: Settings): Promise<Settings | null>;
  getSettings(): Observable<Settings | null>;
  updateSettings(settings: Settings): Promise<void>;
}
export interface SettingsCacheStrategy {
  createSettings(settings: Settings): Promise<Settings | null>;
  getSettings(): Promise<Settings | null>;
  updateSettings(settings: Settings): Promise<void>;
}

export interface SettingsApiStrategy {
  getSettings(userId: string): Promise<Settings | null>;
  updateSettings(userId: string, settings: Settings): Promise<void>;
  createSettings(userId: string, settings: Settings): Promise<Settings | null>;
}
