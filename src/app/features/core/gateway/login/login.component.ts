import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { LoginService } from '../../../../services/login.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;
  showPopupWarning = false;
  warningMessage = '';
  showAlternativeLogin = false;
  currentLoginMethod: 'popup' | 'redirect' | null = null;
  popupBlocked = false;
  private warningTimeout: any = null;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if popups are supported/allowed on page load
    this.checkPopupSupport();

    if (this.loginService.hasPendingOfflineLogin()) {
      this.loading = true;
      try {
        await this.loginService.resumeOfflineLoginIfPending();
      } catch (error) {
        console.error('Resuming offline login failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  // Test if popups work - this gives us insight into popup blocking
  private checkPopupSupport() {
    let blocked = false;
    let error: any = null;

    try {
      const testPopup = window.open('', '_blank', 'width=1,height=1,top=0,left=0');
      if (!testPopup) {
        blocked = true;
      } else {
        testPopup.close();
      }
    } catch (err) {
      blocked = true;
      error = err;
    }

    this.popupBlocked = blocked;

    if (blocked) {
      console.log('❌ Popups appear to be blocked', error ? error : '');
      this.showWarning('Note: Popups appear to be blocked. You may need to enable them for login to work.', true);
    } else {
      console.log('✅ Popups appear to be allowed');
    }
  }

  async loginOnline() {
    this.loading = true;
    this.currentLoginMethod = 'popup';
    this.hideWarning();
    this.showAlternativeLogin = false;
    try {
      console.log('Starting Google login...');
      if (this.popupBlocked) {
        this.showWarning('Popups seem to be blocked. If login fails, try redirect.', true);
        this.showAlternativeLogin = true;
      }
      await this.loginService.loginOnline();
    } catch (error: any) {
      console.error('Login failed:', error);
      this.showAlternativeLogin = true;
      if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup')) {
        this.showWarning('Popup was blocked! Please use redirect.', true);
      } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        this.showWarning('Login was cancelled.');
      } else {
        this.showWarning('Login failed. Please try redirect.');
      }
    } finally {
      this.loading = false;
    }
  }

  async loginOffline() {
    this.loading = true;
    this.currentLoginMethod = null;
    this.showAlternativeLogin = false;
    this.hideWarning();
    try {
      await this.loginService.loginOffline();
    } catch (error) {
      console.error('Offline login failed:', error);
    } finally {
      this.loading = false;
    }
  }

  hideAlternativeLogin() {
    this.showAlternativeLogin = false;
  }

  async loginWithRedirect() {
    this.loading = true;
    this.currentLoginMethod = 'redirect';
    this.hideWarning();
    try {
      console.log('Starting redirect login...');
      await this.loginService.loginWithRedirect();
    } catch (error: any) {
      console.error('Redirect login failed:', error);
      this.showWarning('Redirect login failed. Please try popup.');
      this.loading = false;
      this.currentLoginMethod = null;
    }
  }

  // showWarning(message: string) {
  //   this.showWarning(message, false);
  // }

  showWarning(message: string, persistent = false) {
    this.warningMessage = message;
    this.showPopupWarning = true;
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
    if (!persistent) {
      this.warningTimeout = setTimeout(() => {
        this.hideWarning();
      }, 8000);
    }
  }

  hideWarning() {
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
    this.showPopupWarning = false;
    this.warningMessage = '';
  }

  async logout() {
    try {
      console.log('Logging out...');
      await this.loginService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  goToGateway() {
    this.router.navigate(['/gateway']);
  }
}
