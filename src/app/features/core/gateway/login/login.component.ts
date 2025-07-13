import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskUserInfo } from '../../../../models/service-strategies/user';
import { LoggedInUser } from '../../../../models/user';
import { ErrorService } from '../../../../services/core/error.service';
import { RegistrationService } from '../../../../services/core/registration.service';
import { NavigationService } from '../../../../services/navigation.service';
import { SessionManagerService } from '../../../../services/session-manager.service';
import { CacheOrchestratorService } from '../../../../services/core/cache-orchestrator.service';
import {
  appConfig,
  NAVIGATION_CONFIG,
  OTHER_CONFIG,
} from '../../../../app.config';
import { AuthUser } from '../../../../models/service-strategies/auth-strategy.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loading = false;

  constructor(
    private router: Router,
    private sessionManager: SessionManagerService
  ) {}

  async loginOnline() {
    this.loading = true;
    try {
      await this.sessionManager.initialize('online');
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    } catch (error) {
      console.error('Online login failed:', error);
      this.loading = false;
    }
  }

  async loginOffline() {
    this.loading = true;
    try {
      await this.sessionManager.initialize('offline');
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    } catch (error) {
      console.error('Offline login failed:', error);
      this.loading = false;
    }
  }

  goToGateway() {
    this.router.navigate(['/gateway']);
  }
  // email = '';
  // password = '';
  // isLoggedIn = false;
  // userInfo: TaskUserInfo | undefined;
  // userAuthInfo: AuthUser | undefined;

  // constructor(
  //   private router: Router,
  //   private registration: RegistrationService,
  //   private navigationService: NavigationService,
  //   private sessionManagerService: SessionManagerService,
  //   private cacheService: CacheOrchestratorService,
  //   private errorService: ErrorService
  // ) {}

  // ngOnInit(): void {
  //   this.getAuth()
  //     .getCurrentUser()
  //     .subscribe((r) => {
  //       if (!r) return;
  //       this.userAuthInfo = r;
  //       if (this.registration.isInitialized()) {
  //         this.registration.getUserInfo().then((u) => {
  //           this.userInfo = u;
  //         });
  //       }
  //     });
  // }

  // delay(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  // async logout() {
  //   this.getAuth().logOut();
  // }

  // getAuth() {
  //   return this.sessionManagerService.getAuthStrategy();
  // }

  // async loginOffline() {
  //   try {
  //     this.cacheService.clearCache();
  //     localStorage.removeItem(OTHER_CONFIG.OFFLINE_USER_ID);
  //     const loggedInUser: LoggedInUser = await this.getAuth().login();

  //     if (loggedInUser.isNewUser) {
  //       console.log('New user detected.');
  //       const userInfo = await this.registration.registerNewUser();
  //       if (userInfo) {
  //         userInfo.registered = true;
  //         this.registration.updateUser(userInfo);
  //         // offline no gpt
  //         // this.handleGptApiKey(loggedInUser);
  //       }
  //     } else {
  //       if (!this.userInfo?.registered) {
  //         alert('registration failed');
  //       }
  //     }

  //     const redirectUrl = await this.navigationService.getRedirectUrl();
  //     if (redirectUrl) {
  //       this.navigationService.clearRedirectUrl();
  //       this.router.navigate([redirectUrl]);
  //     } else {
  //       this.router.navigate(['/' + NAVIGATION_CONFIG.ON_LOGIN_ROUTE_URL]); // Default route
  //     }
  //   } catch (error) {
  //     this.error(error);
  //     this.popup('Login failed. Please try again.');
  //   }
  // }

  // async loginWithGmail(): Promise<void> {
  //   try {
  //     this.cacheService.clearCache();
  //     localStorage.removeItem('test_user_id');
  //     const loggedInUser: LoggedInUser = await this.getAuth().loginWithGoogle();

  //     if (loggedInUser.isNewUser) {
  //       console.log('New user detected.');
  //       const userInfo = await this.registration.registerNewUser();
  //       if (userInfo) {
  //         userInfo.registered = true;
  //         this.registration.updateUser(userInfo);
  //         this.handleGptApiKey(loggedInUser);
  //       }
  //     } else {
  //       if (!this.userInfo?.registered) {
  //         alert('registration failed');
  //       }
  //     }

  //     const redirectUrl = await this.navigationService.getRedirectUrl();
  //     if (redirectUrl) {
  //       this.navigationService.clearRedirectUrl();
  //       this.router.navigate([redirectUrl]);
  //     } else {
  //       this.router.navigate(['/' + NAVIGATION_CONFIG.ON_LOGIN_ROUTE_URL]); // Default route
  //     }
  //   } catch (error) {
  //     this.error(error);
  //     this.popup('Login failed. Please try again.');
  //   }
  // }

  // handleGptApiKey(loggedInUser: LoggedInUser) {
  //   if (loggedInUser.isNewUser) return;
  //   this.registration.getUserInfo().then((u) => {
  //     if (!u) return;
  //     if (u.canUseGpt) this.registration.generateApiKey();
  //   });
  // }

  // login(email: string, password: string): void {
  //   // Future implementation for email-password login
  // }

  // error(msg: unknown) {
  //   this.errorService.error(msg);
  // }
  // popup(msg: string) {
  //   this.errorService.popup(msg);
  // }
  // feedback(msg: string) {
  //   this.errorService.feedback(msg);
  // }
}
