import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { LoggedInUser } from '../../models/user';
import { ConfigService } from '../../services/core/config.service';
import { ErrorService } from '../../services/core/error.service';
import { RegistrationService } from '../../services/core/registration.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskUserInfo } from '../../models/service-strategies/user';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
  email = '';
  password = '';
  isLoggedIn = false;

  private authService;
  private cacheService;

  constructor(
    private router: Router,
    private configService: ConfigService,
    private registration: RegistrationService,
    snackBar: MatSnackBar,
    dialog: MatDialog,
    errorService: ErrorService
  ) {
    super(snackBar, dialog, errorService);
    this.authService = this.configService.getAuthStrategy();
    this.cacheService = this.configService.getCacheStrategy();
    // this.apiService = this.configService.getApiStrategy();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        console.log('Redirecting because already logged in');
        if (this.configService.isTesting()) {
          this.delay(1000).then(() => {
            this.router.navigate(['/sentinel']);
          });
        }
        this.router.navigate(['/sentinel']);
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async logout() {
    this.authService.logOut();
  }

  async loginWithGmail(): Promise<void> {
    try {
      this.cacheService.clearCache();
      localStorage.removeItem('test_user_id');
      const loggedInUser: LoggedInUser =
        await this.authService.loginWithGoogle();

      this.log('strategy at login: ' + this.configService.getApiStrategy());

      if (loggedInUser.isNewUser) {
        this.log('New user detected.');
        await this.registerNewUserOrDelete(loggedInUser.userId);
      } else {
        this.handleGptApiKey(loggedInUser);
      }

      this.router.navigate(['/navigator']);
    } catch (error) {
      this.error('Login error:', error);
      this.popup('Login failed. Please try again.');
    }
  }

  handleGptApiKey(loggedInUser: LoggedInUser) {
    this.configService
      .getApiStrategy()
      .getUserInfo(loggedInUser.userId)
      .then((user: TaskUserInfo | undefined) => {
        if (user) {
          if (user && user.canUseGpt) {
            this.configService
              .getApiStrategy()
              .generateApiKey(loggedInUser.userId)
              .then(() => {
                console.log('Api key generated: ');
              });
          }
        }
      });
  }

  async registerNewUserOrDelete(userId: string): Promise<void> {
    let registrationSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!registrationSuccess && retryCount < maxRetries) {
      registrationSuccess = await this.registration.registerUserById(userId);
      if (!registrationSuccess) {
        this.error('Registration attempt failed, retrying...', '');
        retryCount++;
      }
    }

    if (!registrationSuccess) {
      this.feedback(
        'Unable to register after multiple attempts. User will be deleted.'
      );
      await this.authService.deleteCurrentUser();
      throw new Error('Registration failed. Please try again.');
    }
  }

  async deleteUser() {
    await this.authService.deleteCurrentUser();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(email: string, password: string): void {
    // this.authService
    //   .loginWithEmailAndPassword(email, password)
    //   .then(() => {
    //     this.router.navigate(['/protected']);
    //   })
    //   .catch((error) => {
    //     console.error('Login error:', error);
    //   });
  }
}
