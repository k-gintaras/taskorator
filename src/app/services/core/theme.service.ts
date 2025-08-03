import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { SettingsService } from '../../services/sync-api-cache/settings.service';

export type ThemeMode = 'twilight' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taskorator-theme';
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('twilight');
  
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(private settingsService: SettingsService) {
    // Apply theme from localStorage first
    this.initializeTheme();
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const defaultTheme: ThemeMode = 'twilight';
    // Override with persisted TaskSettings theme only if it differs from localStorage
    this.settingsService.getSettingsOnce()
      .then(settings => {
        const remoteTheme = settings?.theme as ThemeMode | undefined;
        // Only override if localStorage still has default and remote has custom
        if (remoteTheme && savedTheme === defaultTheme && remoteTheme !== defaultTheme) {
          this.setTheme(remoteTheme);
        }
      })
      .catch(() => {
        // Ignore if settings API not initialized yet
      });
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const theme = savedTheme || 'twilight';
    this.setTheme(theme);
  }

  setTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    // Reset DaisyUI theme and Tailwind dark class
    html.removeAttribute('data-theme');
    html.classList.remove('dark');

    // Apply DaisyUI theme
    html.setAttribute('data-theme', theme);

    // Apply Tailwind dark mode class for dark theme
    if (theme === 'dark') {
      html.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Update observable
    this.currentThemeSubject.next(theme);
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.value;
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const themes: ThemeMode[] = ['twilight', 'light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  isDarkMode(): boolean {
    const theme = this.getCurrentTheme();
    return theme === 'twilight' || theme === 'dark';
  }

  isLightMode(): boolean {
    return this.getCurrentTheme() === 'light';
  }
}
