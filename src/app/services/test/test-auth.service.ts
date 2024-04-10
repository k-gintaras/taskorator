import { Injectable } from '@angular/core';
import { AuthStrategy } from '../core/interfaces/auth-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class TestAuthService implements AuthStrategy {
  deleteCurrentUser(): void {
    localStorage.removeItem(this.USER_ID_KEY);
  }

  private readonly USER_ID_KEY = 'test_user_id';

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.USER_ID_KEY);
  }

  async getCurrentUserId(): Promise<string | undefined> {
    return localStorage.getItem(this.USER_ID_KEY) || undefined;
  }

  async loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }> {
    try {
      let userId = localStorage.getItem(this.USER_ID_KEY);
      if (!userId) {
        // Simulate new user creation
        userId = 'test_user_' + Math.random().toString(36).substring(7);
        localStorage.setItem(this.USER_ID_KEY, userId);
        console.log('Welcome aboard, space cadet! Charting new territories.');
        return { userId, isNewUser: true };
      } else {
        // User exists, simulate returning user behavior
        console.log(userId);
        console.log('Welcome back, astronaut! Loading your stellar dashboard.');
        return { userId, isNewUser: false };
      }
    } catch (error) {
      console.error('Houston, we have a problem during sign in:', error);
      throw error; // Ensuring the error is not swallowed by the black hole
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.USER_ID_KEY);
  }

  logOut(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  loginWithYahoo(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  loginWithFacebook(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  sendSignInLinkToEmail(email: string): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  confirmSignInWithEmail(url: string): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}
