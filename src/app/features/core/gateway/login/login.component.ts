import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthStateManagerService } from '../../../../services/auth-state-manager.service';
import { NavigationService } from '../../../../services/navigation.service';
import { NAVIGATION_CONFIG } from '../../../../app.config';

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
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService
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
      
      // If we know popups are blocked, show warning immediately
      if (this.popupBlocked) {
        this.showWarning('Popups seem to be blocked. If login fails, try the redirect method below.');
        this.showAlternativeLogin = true;
      }
      
      // Use AuthStateManager for login
      await this.authStateManager.login('online');
      
      // Success - navigate to saved redirect URL or default route
      console.log('Login successful!');
      const redirectUrl = await this.navigationService.getRedirectUrl();
      if (redirectUrl) {
        console.log('Redirecting to saved URL:', redirectUrl);
        this.navigationService.clearRedirectUrl();
        this.router.navigateByUrl(redirectUrl);
      } else {
        console.log('No saved redirect URL, going to default route');
        this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Show alternative login method
      this.showAlternativeLogin = true;
      
      // Give specific error messages
      if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup')) {
        this.showWarning('Popup was blocked! Please use the redirect method below.');
      } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        this.showWarning('Login was cancelled.');
      } else {
        this.showWarning('Login failed. Please try the redirect method below.');
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
      // Use AuthStateManager for offline login
      await this.authStateManager.login('offline');
      
      // Success - navigate to saved redirect URL or default route
      const redirectUrl = await this.navigationService.getRedirectUrl();
      if (redirectUrl) {
        console.log('Offline login successful, redirecting to saved URL:', redirectUrl);
        this.navigationService.clearRedirectUrl();
        this.router.navigateByUrl(redirectUrl);
      } else {
        console.log('Offline login successful, going to default route');
        this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
      }
    } catch (error) {
      console.error('Offline login failed:', error);
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
      
      // Use AuthStateManager for redirect login
      await this.authStateManager.loginWithRedirect();
      
      // Note: This code won't execute as page will redirect
      
    } catch (error: any) {
      console.error('Redirect login failed:', error);
      this.showWarning('Redirect login failed. Please try the popup method instead.');
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
      
      // Use AuthStateManager for logout
      await this.authStateManager.logout();
      
      // Navigate to gateway/login
      this.router.navigate(['/gateway']);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      this.router.navigate(['/gateway']);
    }
  }

  goToGateway() {
    this.router.navigate(['/gateway']);
  }
}
