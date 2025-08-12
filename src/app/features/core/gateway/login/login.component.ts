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

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    // Check if popups are supported/allowed on page load
    this.checkPopupSupport();
    
    // No need to initialize anything - AuthStateManager handles it
  }

  // Test if popups work - this gives us insight into popup blocking
  private checkPopupSupport() {
    try {
      const testPopup = window.open('', '_blank', 'width=1,height=1,top=0,left=0');
      if (testPopup) {
        testPopup.close();
        this.popupBlocked = false;
        console.log('✅ Popups appear to be allowed');
      } else {
        this.popupBlocked = true;
        console.log('❌ Popups appear to be blocked');
        this.showWarning('Note: Popups appear to be blocked. You may need to enable them for login to work.');
      }
    } catch (error) {
      this.popupBlocked = true;
      console.log('❌ Error testing popup support:', error);
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
        this.showWarning('Popups seem to be blocked. If login fails, try redirect.');
        this.showAlternativeLogin = true;
      }
      await this.loginService.loginOnline();
    } catch (error: any) {
      console.error('Login failed:', error);
      this.showAlternativeLogin = true;
      if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup')) {
        this.showWarning('Popup was blocked! Please use redirect.');
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

  showWarning(message: string) {
    this.warningMessage = message;
    this.showPopupWarning = true;
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      this.hideWarning();
    }, 8000);
  }

  hideWarning() {
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
