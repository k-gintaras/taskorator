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

  async loginOnline(): Promise<void> {
    await this.authStateManager.login();
    await this.redirectAfterLogin();
  }

  async loginOffline(): Promise<void> {
    const currentMode = this.modeService.get();
    if (currentMode !== 'offline') {
      throw new Error('Must switch to offline mode first before logging in offline');
    }

    await this.authStateManager.login();
    await this.redirectAfterLogin();
  }

  async loginWithRedirect(): Promise<void> {
    await this.authStateManager.loginWithRedirect();
  }

  async switchToOnlineMode(): Promise<void> {
    console.log('LoginService: Switching to online mode');
    this.modeService.set('online');
  }

  async switchToOfflineMode(): Promise<void> {
    console.log('LoginService: Switching to offline mode');
    this.modeService.set('offline');
  }

  async logout(): Promise<void> {
    await this.authStateManager.logout();
    this.router.navigate(['/gateway/welcome']);
  }

  hasPendingOfflineLogin(): boolean {
    return LoginService.getPendingModeAction() === LoginService.OFFLINE_ACTION_VALUE;
  }

  hasPendingOnlineLogin(): boolean {
    return LoginService.getPendingModeAction() === LoginService.ONLINE_ACTION_VALUE;
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

  async resumeOnlineLoginIfPending(): Promise<boolean> {
    if (LoginService.getPendingModeAction() !== LoginService.ONLINE_ACTION_VALUE) {
      return false;
    }

    LoginService.clearPendingModeAction();
    await this.authStateManager.loginWithRedirect();
    return true;
  }

  async resumePendingLoginIfExists(): Promise<boolean> {
    const pendingAction = LoginService.getPendingModeAction();
    if (pendingAction === LoginService.OFFLINE_ACTION_VALUE) {
      return this.resumeOfflineLoginIfPending();
    }
    if (pendingAction === LoginService.ONLINE_ACTION_VALUE) {
      return this.resumeOnlineLoginIfPending();
    }
    return false;
  }

  private async redirectAfterLogin(): Promise<void> {
    const redirectUrl = await this.navigationService.getRedirectUrl();
    if (redirectUrl) {
      this.navigationService.clearRedirectUrl();
      await this.router.navigateByUrl(redirectUrl);
      return;
    }
    await this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
  }

  private static storePendingOfflineLogin(): void {
    if (!LoginService.hasSessionStorage()) return;
    window.sessionStorage.setItem(LoginService.POST_MODE_ACTION_KEY, LoginService.OFFLINE_ACTION_VALUE);
  }

  private static storePendingAction(action: string): void {
    if (!LoginService.hasSessionStorage()) return;
    window.sessionStorage.setItem(LoginService.POST_MODE_ACTION_KEY, action);
  }

  private static getPendingModeAction(): string | null {
    if (!LoginService.hasSessionStorage()) return null;
    return window.sessionStorage.getItem(LoginService.POST_MODE_ACTION_KEY);
  }

  static clearPendingModeAction(): void {
    if (!LoginService.hasSessionStorage()) return;
    window.sessionStorage.removeItem(LoginService.POST_MODE_ACTION_KEY);
  }

  private static hasSessionStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }
}
