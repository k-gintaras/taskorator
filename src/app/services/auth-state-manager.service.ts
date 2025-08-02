import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './core/auth.service';
import { AuthOfflineService } from './core/auth-offline.service';
import { SessionManagerService } from './session-manager.service';
import { Router } from '@angular/router';
import { OTHER_CONFIG } from '../app.config';

export type AuthMode = 'online' | 'offline';

@Injectable({
  providedIn: 'root'
})
export class AuthStateManagerService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _isInitialized = new BehaviorSubject<boolean>(false);
  private _currentMode = new BehaviorSubject<AuthMode | null>(null);
  private _isLoading = new BehaviorSubject<boolean>(false);

  // Public observables
  readonly isAuthenticated$ = this._isAuthenticated.asObservable();
  readonly isInitialized$ = this._isInitialized.asObservable();
  readonly currentMode$ = this._currentMode.asObservable();
  readonly isLoading$ = this._isLoading.asObservable();

  constructor(
    private authService: AuthService,
    private authOfflineService: AuthOfflineService,
    private sessionManager: SessionManagerService,
    private router: Router
  ) {
    // Initialize auth service listeners
    this.authService.initialize();
    this.authOfflineService.initialize();
  }

  /**
   * Initialize the app - check existing auth state and set up session
   */
  async initializeApp(): Promise<void> {
    console.log('AuthStateManager: Initializing app...');
    this._isLoading.next(true);

    try {
      // Check if we're in testing mode
      const isTestingOffline = OTHER_CONFIG.OFFLINE_TESTING;
      const mode: AuthMode = isTestingOffline ? 'offline' : 'online';

      if (mode === 'online') {
        // Wait for Firebase auth state to settle
        await this.waitForFirebaseAuthState();
        
        if (this.authService.isAuthenticated()) {
          await this.initializeSession('online');
        }
      } else {
        // For offline mode, check if we have offline auth
        if (this.authOfflineService.isAuthenticated()) {
          await this.initializeSession('offline');
        }
      }

      console.log('AuthStateManager: App initialization complete');
    } catch (error) {
      console.error('AuthStateManager: App initialization failed:', error);
    } finally {
      this._isLoading.next(false);
    }
  }

  /**
   * Login with specified mode
   */
  async login(mode: AuthMode = 'online'): Promise<{ userId: string; isNewUser: boolean }> {
    console.log(`AuthStateManager: Starting ${mode} login...`);
    this._isLoading.next(true);

    try {
      let result: { userId: string; isNewUser: boolean };

      if (mode === 'online') {
        result = await this.authService.loginWithGoogle();
      } else {
        result = await this.authOfflineService.login();
      }

      // Initialize session after successful login
      await this.initializeSession(mode);

      console.log(`AuthStateManager: ${mode} login successful`);
      return result;

    } catch (error) {
      console.error(`AuthStateManager: ${mode} login failed:`, error);
      throw error;
    } finally {
      this._isLoading.next(false);
    }
  }

  /**
   * Login with Google redirect
   */
  async loginWithRedirect(): Promise<void> {
    console.log('AuthStateManager: Starting redirect login...');
    this._isLoading.next(true);

    try {
      await this.authService.loginWithGoogleRedirect();
      // Note: Page will redirect, so no need to continue
    } catch (error) {
      this._isLoading.next(false);
      console.error('AuthStateManager: Redirect login failed:', error);
      throw error;
    }
  }

  /**
   * Logout from current session
   */
  async logout(): Promise<void> {
    console.log('AuthStateManager: Logging out...');
    this._isLoading.next(true);

    try {
      const currentMode = this._currentMode.value;

      if (currentMode === 'online') {
        await this.authService.logOut();
      } else if (currentMode === 'offline') {
        await this.authOfflineService.logOut();
      }

      // Clear session
      this.clearState();

      console.log('AuthStateManager: Logout successful');
    } catch (error) {
      console.error('AuthStateManager: Logout error:', error);
      // Force clear state anyway
      this.clearState();
    } finally {
      this._isLoading.next(false);
    }
  }

  /**
   * Ensure session is initialized (for auth guard)
   */
  async ensureInitialized(): Promise<void> {
    // If already initialized, nothing to do
    if (this._isInitialized.value) {
      return;
    }

    // Wait for Firebase auth state to settle (important on page refresh)
    await this.waitForFirebaseAuthState();

    // Check actual auth state (not internal state) to detect existing sessions
    const mode = this.getCurrentAuthMode();
    if (!mode) {
      // Not authenticated in Firebase/localStorage, nothing to initialize
      return;
    }

    // User is authenticated but session not initialized - initialize it
    await this.initializeSession(mode);
  }

  /**
   * Get current authentication status (synchronous)
   */
  isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }

  /**
   * Get current initialization status (synchronous)
   */
  isInitialized(): boolean {
    return this._isInitialized.value;
  }

  /**
   * Get current mode (synchronous)
   */
  getCurrentMode(): AuthMode | null {
    return this._currentMode.value;
  }

  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this._isLoading.value;
  }

  // Private helper methods

  private async initializeSession(mode: AuthMode): Promise<void> {
    console.log(`AuthStateManager: Initializing ${mode} session...`);

    try {
      await this.sessionManager.initialize(mode);

      // Update state
      this._isAuthenticated.next(true);
      this._isInitialized.next(true);
      this._currentMode.next(mode);

      console.log(`AuthStateManager: ${mode} session initialized successfully`);
    } catch (error) {
      console.error(`AuthStateManager: Failed to initialize ${mode} session:`, error);
      this.clearState();
      throw error;
    }
  }

  private clearState(): void {
    this._isAuthenticated.next(false);
    this._isInitialized.next(false);
    this._currentMode.next(null);
  }

  private getCurrentAuthMode(): AuthMode | null {
    if (this.authService.isAuthenticated()) {
      return 'online';
    } else if (this.authOfflineService.isAuthenticated()) {
      return 'offline';
    }
    return null;
  }

  private async waitForFirebaseAuthState(): Promise<void> {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.log('AuthStateManager: Firebase auth state timeout - proceeding anyway');
        resolve();
      }, 5000);

      let settled = false;
      const subscription = this.authService.getCurrentUser().subscribe((user) => {
        if (!settled) {
          settled = true;
          setTimeout(() => {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve();
          }, 1000);
        }
      });
    });
  }
}
