import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../task-model/taskModelManager';
import { Settings, getDefaultSettings } from '../task-model/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings = new BehaviorSubject<Settings>(getDefaultSettings());
  constructor() {}

  getSettings() {
    return this.settings.asObservable();
  }

  setSettings(s: Settings) {
    this.settings.next(s);
  }
}
