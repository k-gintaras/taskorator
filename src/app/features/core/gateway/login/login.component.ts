import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { LoginService } from '../../../../services/login.service';
import { ModeService } from '../../../../services/mode.service';
import { AuthStateManagerService } from '../../../../services/auth-state-manager.service';
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

  // State tracking
  currentMode: 'online' | 'offline' | null = null;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private modeService: ModeService,
    private authStateManager: AuthStateManagerService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if popups are supported/allowed on page load
    this.checkPopupSupport();

    // Get current state
    this.currentMode = this.modeService.get();
    this.isAuthenticated = this.authStateManager.isAuthenticated();

    console.log('LoginComponent: Mode:', this.currentMode, 'Authenticated:', this.isAuthenticated);
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
    if (this.currentMode !== 'online') {
      this.showWarning('Please switch to online mode first.', false);
      return;
    }

    // Prevent double-clicks while loading
    if (this.loading) {
      console.log('LoginComponent: Login already in progress, ignoring click');
      return;
    }

    this.loading = true;
    this.currentLoginMethod = 'popup';
    this.hideWarning();
    this.showAlternativeLogin = false;
    try {
      console.log('LoginComponent: Starting Google login...');
      if (this.popupBlocked) {
        this.showWarning('Popups seem to be blocked. If login fails, try redirect.', true);
        this.showAlternativeLogin = true;
      }
      await this.loginService.loginOnline();
    } catch (error: any) {
      console.error('LoginComponent: Login failed:', error);
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
    if (this.currentMode !== 'offline') {
      this.showWarning('Please switch to offline mode first.', false);
      return;
    }

    // Prevent double-clicks while loading
    if (this.loading) {
      console.log('LoginComponent: Login already in progress, ignoring click');
      return;
    }

    this.loading = true;
    this.currentLoginMethod = null;
    this.showAlternativeLogin = false;
    this.hideWarning();
    try {
      console.log('LoginComponent: Starting offline login...');
      await this.loginService.loginOffline();
    } catch (error) {
      console.error('LoginComponent: Offline login failed:', error);
      this.showWarning('Offline login failed. Please try again.', false);
    } finally {
      this.loading = false;
    }
  }

  hideAlternativeLogin() {
    this.showAlternativeLogin = false;
  }

  async loginWithRedirect() {
    if (this.currentMode !== 'online') {
      this.showWarning('Please switch to online mode first.', false);
      return;
    }

    // Prevent double-clicks while loading
    if (this.loading) {
      console.log('LoginComponent: Login already in progress, ignoring click');
      return;
    }

    this.loading = true;
    this.currentLoginMethod = 'redirect';
    this.hideWarning();
    try {
      console.log('LoginComponent: Starting redirect login...');
      await this.loginService.loginWithRedirect();
    } catch (error: any) {
      console.error('LoginComponent: Redirect login failed:', error);
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
      console.log('LoginComponent: Logging out...');
      await this.loginService.logout();
    } catch (error) {
      console.error('LoginComponent: Logout error:', error);
    }
  }

  async switchToOnlineMode() {
    if (this.isAuthenticated) {
      this.showWarning('You must logout before switching modes.', false);
      return;
    }

    console.log('LoginComponent: Switching to online mode...');
    this.loading = true;
    this.warningMessage = 'Switching to online mode...';
    this.showPopupWarning = true;
    
    try {
      await this.loginService.switchToOnlineMode();
      // Page will reload
    } catch (error) {
      console.error('LoginComponent: Mode switch failed:', error);
      this.showWarning('Failed to switch mode. Please try again.', false);
    } finally {
      this.loading = false;
    }
  }

  async switchToOfflineMode() {
    if (this.isAuthenticated) {
      this.showWarning('You must logout before switching modes.', false);
      return;
    }

    console.log('LoginComponent: Switching to offline mode...');
    this.loading = true;
    this.warningMessage = 'Switching to offline mode...';
    this.showPopupWarning = true;
    
    try {
      await this.loginService.switchToOfflineMode();
      // Page will reload
    } catch (error) {
      console.error('LoginComponent: Mode switch failed:', error);
      this.showWarning('Failed to switch mode. Please try again.', false);
    } finally {
      this.loading = false;
    }
  }
}