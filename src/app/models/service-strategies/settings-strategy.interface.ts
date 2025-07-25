import { Observable } from 'rxjs';
import { TaskSettings } from '../settings';

export interface SettingsStrategy {
  createSettings(settings: TaskSettings): Promise<TaskSettings | null>;
  getSettings(): Observable<TaskSettings | null>;
  updateSettings(settings: TaskSettings): Promise<void>;
}
export interface SettingsCacheStrategy {
  createSettings(settings: TaskSettings): void;
  getSettings(): Promise<TaskSettings | null> | TaskSettings | null;
  updateSettings(settings: TaskSettings): void;
}

export interface SettingsApiStrategy {
  getSettings(): Promise<TaskSettings | null>;
  updateSettings(settings: TaskSettings): Promise<void>;
  createSettings(settings: TaskSettings): Promise<TaskSettings | null>;
}
