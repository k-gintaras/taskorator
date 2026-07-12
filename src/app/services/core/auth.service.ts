import { Injectable, inject } from '@angular/core';
import { AuthStrategy, AuthUser } from '../../models/service-strategies/auth-strategy.interface';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User, UserCredential } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
import { getAdditionalUserInfo } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService implements AuthStrategy {
  private auth = inject(Auth);
  private authenticated = false;

  constructor() {
    authState(this.auth).subscribe((user) => {
      console.log(user ? `User logged in: ${user.uid}` : 'User logged out');
      this.authenticated = !!user;
    });
  }

  initialize() {}

  login(): Promise<{ userId: string; isNewUser: boolean }> {
    throw new Error('Method not implemented.');
  }

  async deleteCurrentUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await user.delete();
      console.log('User deleted successfully');
    } else {
      console.warn('No currently authenticated user');
    }
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async getCurrentUserId(): Promise<string | undefined> {
    const user = this.auth.currentUser;
    return user?.uid;
  }

  getCurrentUserIdSync(): string | undefined {
    return this.auth.currentUser?.uid;
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return authState(this.auth).pipe(
      map((user: User | null) =>
        user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              isAnonymous: user.isAnonymous,
              emailVerified: user.emailVerified,
            }
          : null
      )
    );
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  isAuthenticatedObservable(): Observable<boolean> {
    return this.getCurrentUser().pipe(map((user) => !!user));
  }

  async logOut(): Promise<void> {
    await this.auth.signOut();
  }

  async sendSignInLinkToEmail(_email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async confirmSignInWithEmail(_url: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }> {
    try {
      console.log('Starting Google sign-in process...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });

      console.log('Attempting to open popup for Google authentication...');
      const cred: UserCredential = await signInWithPopup(this.auth, provider);
      const info = getAdditionalUserInfo(cred);
      const isNewUser = info?.isNewUser ?? false;
      return { userId: cred.user.uid, isNewUser };
    } catch (error) {
      console.error('Error during sign in with Google:', error);
      if (error instanceof Error) {
        if (error.message.includes('popup') || error.message.includes('blocked')) {
          throw new Error('POPUP_BLOCKED');
        } else if (error.message.includes('network') || error.message.includes('offline')) {
          throw new Error('NETWORK_ERROR');
        } else if (error.message.includes('cancelled') || error.message.includes('closed')) {
          throw new Error('USER_CANCELLED');
        }
      }
      throw error as any;
    }
  }

  async checkForRedirectResult(): Promise<{ userId: string; isNewUser: boolean } | null> {
    try {
      const cred = await getRedirectResult(this.auth);
      if (!cred || !cred.user) return null;
      const info = getAdditionalUserInfo(cred);
      const isNewUser = info?.isNewUser ?? false;
      return { userId: cred.user.uid, isNewUser };
    } catch (error) {
      console.warn('Error checking redirect result:', error);
      return null;
    }
  }

  async loginWithGoogleRedirect(): Promise<{ userId: string; isNewUser: boolean }> {
    console.log('Using redirect method for Google authentication...');
    const redirectResult = await this.checkForRedirectResult();
    if (redirectResult) return redirectResult;

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    await signInWithRedirect(this.auth, provider);
    throw new Error('Redirecting to Google authentication...');
  }

  loginWithYahoo(): Promise<unknown> { throw new Error('Method not implemented.'); }
  loginWithFacebook(): Promise<unknown> { throw new Error('Method not implemented.'); }
}
