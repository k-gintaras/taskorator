import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AuthStrategy,
  AuthUser,
} from '../../models/service-strategies/auth-strategy.interface';
import { OTHER_CONFIG } from '../../app.config';

export interface OfflineUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthOfflineService implements AuthStrategy {
  private currentUser = new BehaviorSubject<AuthUser | null>(null);
  // Dynamic storage key: include profile suffix in test mode
  private get localStorageKey(): string {
    const base = OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    if (OTHER_CONFIG.TEST_DATA_MODE && OTHER_CONFIG.TEST_USER_PROFILE) {
      return `${base}-${OTHER_CONFIG.TEST_USER_PROFILE}`;
    }
    return base;
  }

  constructor() {}

  /**
   * Initializes the service by checking local storage for an existing user.
   */
  initialize(): void {
    const storedUser = localStorage.getItem(this.localStorageKey);
    if (storedUser) {
      const user: AuthUser = JSON.parse(storedUser);
      this.currentUser.next(user);
      console.log('Restored offline user from local storage:', user);
    } else {
      console.log('No offline user found in local storage.');
      // Clear any existing user to force new user creation
      this.currentUser.next(null);
    }
  }

  /**
   * Logs in as an offline user. If no user exists in local storage, creates a new one.
   */
  async login(): Promise<{ userId: string; isNewUser: boolean }> {
    // Use configured offline user ID (may include test profile suffix)
    const configuredId = this.localStorageKey;
    let offlineUser = this.currentUser.getValue();
    const isNewUser = offlineUser === null;

    if (isNewUser) {
      console.log('Creating new offline user...');
      // Create a new offline user with configured ID
      offlineUser = {
        uid: configuredId,
        displayName: 'Offline User',
        email: null,
        isAnonymous: true,
        emailVerified: false,
        isNewUser: true,
      };

      this.currentUser.next(offlineUser);
      localStorage.setItem(this.localStorageKey, JSON.stringify(offlineUser));
      console.log('Created new offline user:', offlineUser);
    } else {
      console.log('Logged in as existing offline user:', offlineUser);
    }

    // Return user ID and new-user flag
    return { userId: offlineUser!.uid, isNewUser };
  }

  /**
   * Logs out the current offline user.
   */
  async logOut(): Promise<void> {
    this.currentUser.next(null);
    localStorage.removeItem(this.localStorageKey);
    console.log('Logged out of offline mode');
  }

  /**
   * Deletes the current offline user.
   */
  async deleteCurrentUser(): Promise<void> {
    await this.logOut(); // Log out and remove user data.
    console.log('Offline user deleted');
  }

  /**
   * Updates the offline user's profile and persists it to local storage.
   */
  updateProfile(updatedProfile: Partial<OfflineUser>): void {
    const currentUser = this.currentUser.getValue();

    if (!currentUser) {
      console.error('No user is logged in to update the profile.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      ...updatedProfile,
    };

    this.currentUser.next(updatedUser);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedUser));
    console.log('Offline user profile updated:', updatedUser);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser.getValue();
  }

  async getCurrentUserId(): Promise<string | undefined> {
    const user = this.currentUser.getValue();
    return user ? user.uid : undefined;
  }

  getCurrentUserIdSync(): string | undefined {
    return this.currentUser.getValue()?.uid;
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser.asObservable();
  }

  // Unsupported methods for offline mode
  async loginWithEmailAndPassword(): Promise<void> {
    throw new Error('Offline mode does not support email/password login.');
  }

  async loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }> {
    throw new Error('Offline mode does not support Google login.');
  }

  async loginWithYahoo(): Promise<unknown> {
    throw new Error('Offline mode does not support Yahoo login.');
  }

  async loginWithFacebook(): Promise<unknown> {
    throw new Error('Offline mode does not support Facebook login.');
  }

  async sendSignInLinkToEmail(): Promise<unknown> {
    throw new Error('Offline mode does not support passwordless login.');
  }

  async confirmSignInWithEmail(): Promise<unknown> {
    throw new Error('Offline mode does not support passwordless login.');
  }
}
