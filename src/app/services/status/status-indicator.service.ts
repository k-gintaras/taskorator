import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthStateManagerService } from '../auth-state-manager.service';
import { ModeService } from '../mode.service';
import { OTHER_CONFIG } from '../../app.config';

export interface StatusState {
  type: 'authenticated' | 'unauthenticated' | 'offline';
  message: string;
  icon: string;
  color: string; // CSS variable name
}

@Injectable({
  providedIn: 'root'
})
export class StatusIndicatorService {
    appTitle = OTHER_CONFIG.APP_TITLE || 'Taskorator';
  
  private _showStatus = new BehaviorSubject<boolean>(false);
  
  // Public observable for status visibility
  readonly showStatus$ = this._showStatus.asObservable();
  
  // Combined status observable
  readonly statusState$: Observable<StatusState> = combineLatest([
    this.authStateManager.isAuthenticated$,
    this.authStateManager.currentMode$,
    this.authStateManager.isInitialized$
  ]).pipe(
    map(([isAuthenticated, currentMode, isInitialized]) => {
      if (!isInitialized) {
        return {
          type: 'unauthenticated' as const,
          message: 'Initializing...',
          icon: 'sync',
          color: '--text-secondary'
        };
      }

      if (currentMode === 'offline') {
        return {
          type: 'offline' as const,
          message: 'Offline Mode',
          icon: 'cloud_off',
          color: '--warning-primary'
        };
      }

      if (isAuthenticated) {
        return {
          type: 'authenticated' as const,
          message: 'Signed In',
          icon: 'account_circle',
          color: '--success-primary'
        };
      }

      return {
        type: 'unauthenticated' as const,
        message: 'Not Signed In',
        icon: 'account_circle',
        color: '--error-primary'
      };
    })
  );

  constructor(
    private authStateManager: AuthStateManagerService,
    private modeService: ModeService
  ) {
    // Auto-show status for a few seconds when status changes
    this.statusState$.subscribe(() => {
      this.showStatusTemporarily();
    });
  }

  /**
   * Show status indicator temporarily (3 seconds)
   */
  showStatusTemporarily(): void {
    this._showStatus.next(true);
    setTimeout(() => {
      this._showStatus.next(false);
    }, 3000);
  }

  /**
   * Toggle status visibility manually
   */
  toggleStatus(): void {
    this._showStatus.next(!this._showStatus.value);
  }

  /**
   * Get current mode from ModeService
   */
  getCurrentMode(): 'online' | 'offline' {
    return this.modeService.get();
  }

  /**
   * Switch between online and offline modes
   */
  toggleMode(): void {
    const currentMode = this.getCurrentMode();
    const newMode = currentMode === 'online' ? 'offline' : 'online';
    this.modeService.set(newMode);
  }
}