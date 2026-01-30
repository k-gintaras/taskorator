import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateManagerService } from './auth-state-manager.service';
import { NavigationService } from './navigation.service';
import { ModeService } from './mode.service';
import { NAVIGATION_CONFIG } from '../app.config';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private static readonly POST_MODE_ACTION_KEY = 'taskorator-post-mode-login';
  private static readonly OFFLINE_ACTION_VALUE = 'offline-login';
  private static readonly ONLINE_ACTION_VALUE = 'online-login';
  constructor(
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService,
    private router: Router,
    private modeService: ModeService,
  ) {}

  /** Perform online login and redirect appropriately */
  async loginOnline(): Promise<void> {
    const currentMode = this.modeService.get();
    
    // Should only be called when already in online mode (mode selector handles switching)
    if (currentMode !== 'online') {
      throw new Error('Must switch to online mode first before logging in with Google');
    }

    await this.authStateManager.login();
    // DISABLED: Fire and forget AI API login for faster main app startup - requires deployed AI API backend
    // this.aiApiFirebase.loginGoogle();
    await this.redirectAfterLogin();
  }

  /** Perform offline login and redirect appropriately */
  async loginOffline(): Promise<void> {
    const currentMode = this.modeService.get();
    
    // Should only be called when already in offline mode (mode selector handles switching)
    if (currentMode !== 'offline') {
      throw new Error('Must switch to offline mode first before logging in offline');
    }

    await this.authStateManager.login();
    await this.redirectAfterLogin();
  }

  /** Perform redirect-based login (common for popup-block scenarios) */
  async loginWithRedirect(): Promise<void> {
    await this.authStateManager.loginWithRedirect();
  }

  /** Switch to online mode and refresh page (user must be logged out) */
  async switchToOnlineMode(): Promise<void> {
    console.log('LoginService: Switching to online mode');
    this.modeService.set('online');
    // Page will reload
  }

  /** Switch to offline mode and refresh page (user must be logged out) */
  async switchToOfflineMode(): Promise<void> {
    console.log('LoginService: Switching to offline mode');
    this.modeService.set('offline');
    // Page will reload
  }

  /** Logout and navigate to welcome route */
  async logout(): Promise<void> {
    await this.authStateManager.logout();
    this.router.navigate(['/gateway/welcome']);
  }

  hasPendingOfflineLogin(): boolean {
    return (
      LoginService.getPendingModeAction() ===
      LoginService.OFFLINE_ACTION_VALUE
    );
  }

  hasPendingOnlineLogin(): boolean {
    return (
      LoginService.getPendingModeAction() ===
      LoginService.ONLINE_ACTION_VALUE
    );
  }

  async resumeOfflineLoginIfPending(): Promise<boolean> {
    if (LoginService.getPendingModeAction() !== LoginService.OFFLINE_ACTION_VALUE) {
      console.log('LoginService: No pending offline login found');
      return false;
    }

    console.log('LoginService: Resuming pending offline login');
    LoginService.clearPendingModeAction();
    
    try {
      await this.authStateManager.login();
      await this.redirectAfterLogin();
      console.log('LoginService: Pending offline login completed successfully');
      return true;
    } catch (error) {
      console.error('LoginService: Pending offline login failed:', error);
      throw error;
    }
  }

  async resumeOnlineLoginIfPending(): Promise<boolean> {
    if (LoginService.getPendingModeAction() !== LoginService.ONLINE_ACTION_VALUE) {
      console.log('LoginService: No pending online login found');
      return false;
    }

    console.log('LoginService: Resuming pending online login using redirect flow');
    LoginService.clearPendingModeAction();
    
    try {
      console.log('LoginService: About to call authStateManager.loginWithRedirect()');
      // Use redirect login instead of popup - no browser restrictions, works after mode switch
      // This will redirect to Google, then Google redirects back to app
      await this.authStateManager.loginWithRedirect();
      // This throws on redirect, so next line won't execute during normal flow
      console.log('LoginService: Pending online login completed');
      return true;
    } catch (error) {
      console.error('LoginService: Pending online login redirect error:', error);
      // Redirect login throws on redirect, which is expected
      // The redirect flow handles authentication externally
      throw error;
    }
  }

  /**
   * Resume any pending login (online or offline)
   * Called on page load after mode switch
   */
  async resumePendingLoginIfExists(): Promise<boolean> {
    const pendingAction = LoginService.getPendingModeAction();
    
    if (pendingAction === LoginService.OFFLINE_ACTION_VALUE) {
      return this.resumeOfflineLoginIfPending();
    } else if (pendingAction === LoginService.ONLINE_ACTION_VALUE) {
      return this.resumeOnlineLoginIfPending();
    }
    
    return false;
  }

  private async redirectAfterLogin(): Promise<void> {
    const redirectUrl = await this.navigationService.getRedirectUrl();
    if (redirectUrl) {
      this.navigationService.clearRedirectUrl();
      await this.router.navigateByUrl(redirectUrl);
    } else {
      await this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    }
  }

  private static storePendingOfflineLogin(): void {
    if (!LoginService.hasSessionStorage()) return;
    window.sessionStorage.setItem(
      LoginService.POST_MODE_ACTION_KEY,
      LoginService.OFFLINE_ACTION_VALUE
    );
  }

  private static storePendingAction(action: string): void {
    if (!LoginService.hasSessionStorage()) return;
    console.log('LoginService: Storing pending action:', action);
    window.sessionStorage.setItem(LoginService.POST_MODE_ACTION_KEY, action);
  }

  private static getPendingModeAction(): string | null {
    if (!LoginService.hasSessionStorage()) return null;
    return window.sessionStorage.getItem(LoginService.POST_MODE_ACTION_KEY);
  }

  /** Clear pending mode action from session storage */
  static clearPendingModeAction(): void {
    if (!LoginService.hasSessionStorage()) return;
    window.sessionStorage.removeItem(LoginService.POST_MODE_ACTION_KEY);
  }

  private static hasSessionStorage(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.sessionStorage !== 'undefined'
    );
  }
}
