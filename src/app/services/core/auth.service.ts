import { Injectable } from '@angular/core';
import { AuthStrategy } from './interfaces/auth-strategy.interface';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from '@angular/fire/auth';
import { RegistrationService } from './registration.service';
/**
 * @remarks
 * various ways to login and register with injected `RegistrationService` to help with with creation of data
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthStrategy {
  constructor(private auth: Auth, private registration: RegistrationService) {}

  async register(email: string, password: string): Promise<void> {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // we do this here so to guarantee stuff is done and to not forget it
      this.registration.registerUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUserId(): Promise<string | undefined> {
    const user = this.auth.currentUser;
    return user ? user.uid : undefined;
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  async logOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async sendSignInLinkToEmail(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async confirmSignInWithEmail(url: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const user = await signInWithPopup(this.auth, provider);

      // Use getAdditionalUserInfo to check for new user
      const additionalUserInfo = getAdditionalUserInfo(user);
      const isNewUser = additionalUserInfo?.isNewUser;

      if (isNewUser) {
        console.log(
          'Welcome aboard, space cadet! Performing first-time sign-in operations.'
        );
        this.registration.registerUser(user);
      } else {
        console.log('Welcome back, astronaut! Loading your dashboard.');
        // Handle returning user logic
      }
    } catch (error) {
      console.error('Error during sign in with Google:', error);
    }
  }

  loginWithYahoo(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  loginWithFacebook(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}
