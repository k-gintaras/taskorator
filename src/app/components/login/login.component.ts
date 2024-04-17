import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggedInUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/core/auth.service';
import { ConfigService } from 'src/app/services/core/config.service';
import { RegistrationService } from 'src/app/services/core/registration.service';
import { BaseComponent } from '../base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorService } from 'src/app/services/core/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent extends BaseComponent implements OnInit {
  email = '';
  password = '';
  isLoggedIn = false;

  private authService;
  private cacheService;
  private apiService;

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
    this.apiService = this.configService.getApiStrategy();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        console.log('Redirecting because already logged in');
        // this.router.navigate(['/protected']);
      }
    });
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
      }

      this.router.navigate(['/protected']);
    } catch (error) {
      this.error('Login error:', error);
      this.popup('Login failed. Please try again.');
    }
  }

  async registerNewUserOrDelete(userId: string): Promise<void> {
    let registrationSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!registrationSuccess && retryCount < maxRetries) {
      registrationSuccess = await this.registration.registerUserById(userId);
      console.log('registration successful');
      console.log('registration successful');
      console.log('registration successful');
      console.log('registration successful');
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
  // async loginWithGmail(): Promise<void> {
  //   try {
  //     this.cacheService.clearCache();
  //     localStorage.removeItem('test_user_id');
  //     const loggedInUser: LoggedInUser =
  //       await this.authService.loginWithGoogle();
  //     const strategy = this.configService.getApiStrategy();
  //     console.log('strategy at login');
  //     console.log(strategy);

  //     if (loggedInUser.isNewUser) {
  //       console.log('new User');
  //       await this.registerNewUser(loggedInUser.userId);
  //     }

  //     this.router.navigate(['/protected']);
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     // Display an error message to the user
  //     alert('Login failed. Please try again.');
  //   }
  // }

  // async registerNewUser(userId: string): Promise<void> {
  //   // await this.registration.registerUserById(userId);

  //   let registrationSuccess = false;
  //   let retryCount = 0;
  //   const maxRetries = 3;

  //   while (!registrationSuccess && retryCount < maxRetries) {
  //     registrationSuccess = await this.registration.registerUserById(userId);
  //     if (!registrationSuccess) {
  //       this.error('Registration failed. Retrying...');
  //       retryCount++;
  //     }
  //   }

  //   if (!registrationSuccess) {
  //     this.feedback(
  //       'Registration failed after multiple attempts. Deleting user...'
  //     );
  //     await this.authService.deleteCurrentUser();
  //     throw new Error('Registration failed. Please try again.');
  //   }
  // }

  async deleteUser() {
    await this.authService.deleteCurrentUser();
  }

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
