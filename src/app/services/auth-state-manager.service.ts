import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './core/auth.service';
import { AuthOfflineService } from './core/auth-offline.service';
import { SessionManagerService } from './session-manager.service';
import { Router } from '@angular/router';
import { CacheOrchestratorService } from './core/cache-orchestrator.service';
import { ModeService } from './mode.service';
import { ConfigService } from './config.service';

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
    private cacheOrchestrator: CacheOrchestratorService,
    private router: Router,
    private modeService: ModeService,
    private config: ConfigService
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
      // Determine mode via ConfigService
      const mode: AuthMode = this.config.offlineTesting ? 'offline' : 'online';

      if (mode === 'online') {
        // Wait for Firebase auth state to settle
        await this.waitForFirebaseAuthState();
        if (this.authService.isAuthenticated()) {
          await this.initializeSession();
        }
      } else {
        // For offline mode, check if we have offline auth
        if (this.authOfflineService.isAuthenticated()) {
          await this.initializeSession();
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
   * Login based on current ModeService setting
   */
  async login(): Promise<{ userId: string; isNewUser: boolean }> {
    const mode: AuthMode = this.modeService.get();
    console.log(`AuthStateManager: Starting ${mode} login...`);
    this._isLoading.next(true);
    // Clear any existing caches to avoid mixing tasks between users/modes
    this.cacheOrchestrator.clearCache();

    try {
      let result: { userId: string; isNewUser: boolean };

      if (mode === 'online') {
        // Initialize online session
        await this.sessionManager.initialize();
        // Perform Google auth
        result = await this.sessionManager.getAuthStrategy().loginWithGoogle();
        // If first-time user, register initial data
        if (result.isNewUser) {
          console.log('AuthStateManager: New online user detected, registering data');
          const registered = await this.sessionManager.registerOnlineUser();
          console.log(
            `AuthStateManager: Online user data registration ${registered ? 'succeeded' : 'failed'}`
          );
        }
        // Complete session initialization
        await this.initializeSession();
      } else {
        // Perform offline login
        result = await this.authOfflineService.login();
        // Seed test data or real data
        if (this.config.testDataMode) {
          console.log('AuthStateManager: Test data mode enabled, initializing test data');
          const seeded = await this.sessionManager.registerOfflineUser();
          console.log(
            `AuthStateManager: Test data initialization ${seeded ? 'succeeded' : 'failed'}`
          );
        } else if (result.isNewUser) {
          console.log('AuthStateManager: New offline user detected, registering data');
          const seeded = await this.sessionManager.registerOfflineUser();
          console.log(
            `AuthStateManager: Offline user data registration ${seeded ? 'succeeded' : 'failed'}`
          );
        }
        // Initialize session after offline login
        await this.initializeSession();
      }

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
      // Initialize session first to set up the auth strategy
      await this.sessionManager.initialize();
      // Get the auth strategy and cast to Firebase helper for redirect method
      const authStrategy = this.sessionManager.getAuthStrategy();
      if ('loginWithGoogleRedirect' in authStrategy) {
        await (authStrategy as any).loginWithGoogleRedirect();
      } else {
        throw new Error('Redirect login not supported by current auth strategy');
      }
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
        await this.sessionManager.getAuthStrategy().logOut();
      } else if (currentMode === 'offline') {
        await this.authOfflineService.logOut();
      }

      // Clear session and caches
      this.clearState();
      this.cacheOrchestrator.clearCache();

      console.log('AuthStateManager: Logout successful');
    } catch (error) {
      console.error('AuthStateManager: Logout error:', error);
      // Force clear session and caches
      this.clearState();
      this.cacheOrchestrator.clearCache();
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
    await this.initializeSession();
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

  private async initializeSession(): Promise<void> {
    const mode: AuthMode = this.modeService.get()!;
    console.log(`AuthStateManager: Initializing ${mode} session...`);
    try {
      await this.sessionManager.initialize();

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
