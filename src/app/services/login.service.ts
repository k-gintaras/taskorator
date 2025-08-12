import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateManagerService } from './auth-state-manager.service';
import { NavigationService } from './navigation.service';
import { NAVIGATION_CONFIG } from '../app.config';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService,
    private router: Router
  ) {}

  /** Perform online login and redirect appropriately */
  async loginOnline(): Promise<void> {
    await this.authStateManager.login('online');
    const redirectUrl = await this.navigationService.getRedirectUrl();
    if (redirectUrl) {
      this.navigationService.clearRedirectUrl();
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    }
  }

  /** Perform offline login and redirect appropriately */
  async loginOffline(): Promise<void> {
    await this.authStateManager.login('offline');
    const redirectUrl = await this.navigationService.getRedirectUrl();
    if (redirectUrl) {
      this.navigationService.clearRedirectUrl();
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    }
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
}
