import { Injectable } from '@angular/core';
import { ThemeService, ThemeMode } from './core/theme.service';
import { SettingsService } from './sync-api-cache/settings.service';
import { TaskSettings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class ExtraActionsService {
  constructor(
    private themeService: ThemeService,
    private settingsService: SettingsService
  ) {}

  toggleTheme(): void {
    // Toggle theme and persist to settings
    this.themeService.toggleTheme();
    const newTheme = this.themeService.getCurrentTheme();
    // Update user settings with new theme
    this.settingsService.getSettingsOnce()
      .then(settings => {
        if (settings) {
          const updated: TaskSettings = { ...settings, theme: newTheme } as TaskSettings;
          this.settingsService.updateSettings(updated).catch(console.error);
        }
      })
      .catch(console.error);
  }

  getCurrentTheme(): ThemeMode {
    return this.themeService.getCurrentTheme();
  }
}
