import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION_CONFIG } from '../../../../app.config';
import { LoginService } from '../../../../services/login.service';
import { AuthStateManagerService } from '../../../../services/auth-state-manager.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;
  showWarningBanner = false;
  warningMessage = '';
  isAuthenticated = false;
  private warningTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private authStateManager: AuthStateManagerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authStateManager.isAuthenticated();
  }

  continueToApp(): void {
    this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]).catch((e) => {
      console.error('LoginComponent: Continue navigation failed', e);
    });
  }

  async loginOnline(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.hideWarning();
    try {
      await this.loginService.loginOnline();
    } catch (error: any) {
      console.error('LoginComponent: Login failed:', error);
      this.showWarning(
        error?.code === 'auth/popup-blocked' || error?.message?.includes('popup')
          ? 'Popup was blocked. Use redirect login.'
          : 'Login failed. Please try again.'
      );
    } finally {
      this.loading = false;
    }
  }

  async loginWithRedirect(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.hideWarning();
    try {
      await this.loginService.loginWithRedirect();
    } catch (error) {
      console.error('LoginComponent: Redirect login failed:', error);
      this.showWarning('Redirect login failed. Please try again.');
      this.loading = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.loginService.logout();
      this.isAuthenticated = false;
    } catch (error) {
      console.error('LoginComponent: Logout error:', error);
    }
  }

  showWarning(message: string, persistent = false): void {
    this.warningMessage = message;
    this.showWarningBanner = true;
    if (this.warningTimeout) clearTimeout(this.warningTimeout);
    if (!persistent) {
      this.warningTimeout = setTimeout(() => this.hideWarning(), 8000);
    }
  }

  hideWarning(): void {
    if (this.warningTimeout) clearTimeout(this.warningTimeout);
    this.warningTimeout = null;
    this.showWarningBanner = false;
    this.warningMessage = '';
  }
}
