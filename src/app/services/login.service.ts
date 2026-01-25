import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateManagerService } from './auth-state-manager.service';
import { NavigationService } from './navigation.service';
import { ModeService } from './mode.service';
import { AiApiFirebaseService } from './core/ai-api-firebase.service';
import { NAVIGATION_CONFIG } from '../app.config';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService,
    private router: Router,
    private modeService: ModeService,
    private aiApiFirebase: AiApiFirebaseService
  ) {}

  /** Perform online login and redirect appropriately */
  async loginOnline(): Promise<void> {
    this.modeService.set('online');
    await this.authStateManager.login();
    
    // Fire and forget AI API login for faster main app startup
    this.aiApiFirebase.loginGoogle();

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
    this.modeService.set('offline');
    await this.authStateManager.login();
    // Note: No AI API login in offline mode

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
