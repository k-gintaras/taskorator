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
  constructor(
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService,
    private router: Router,
    private modeService: ModeService,
  ) {}

  /** Perform online login and redirect appropriately */
  async loginOnline(): Promise<void> {
    this.modeService.set('online');
    await this.authStateManager.login();

    // DISABLED: Fire and forget AI API login for faster main app startup - requires deployed AI API backend
    // this.aiApiFirebase.loginGoogle();

    await this.redirectAfterLogin();
  }

  /** Perform offline login and redirect appropriately */
  async loginOffline(): Promise<void> {
    if (this.modeService.get() !== 'offline') {
      LoginService.storePendingOfflineLogin();
      this.modeService.set('offline');
      return;
    }

    await this.authStateManager.login();
    await this.redirectAfterLogin();
  }

  /** Perform redirect-based login (common for popup-block scenarios) */
  async loginWithRedirect(): Promise<void> {
    await this.authStateManager.loginWithRedirect();
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

  async resumeOfflineLoginIfPending(): Promise<boolean> {
    if (LoginService.getPendingModeAction() !== LoginService.OFFLINE_ACTION_VALUE) {
      return false;
    }

    LoginService.clearPendingModeAction();
    await this.authStateManager.login();
    await this.redirectAfterLogin();
    return true;
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

  private static getPendingModeAction(): string | null {
    if (!LoginService.hasSessionStorage()) return null;
    return window.sessionStorage.getItem(LoginService.POST_MODE_ACTION_KEY);
  }

  private static clearPendingModeAction(): void {
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
