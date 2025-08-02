import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'twilight' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taskorator-theme';
  private currentThemeSubject = new BehaviorSubject<ThemeMode>('twilight');
  
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const theme = savedTheme || 'twilight';
    this.setTheme(theme);
  }

  setTheme(theme: ThemeMode): void {
    // Remove existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Apply new theme
    if (theme !== 'twilight') {
      document.documentElement.setAttribute('data-theme', theme);
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
