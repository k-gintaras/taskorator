import { Injectable } from '@angular/core';
import { AuthStrategy } from '../../models/service-strategies/auth-strategy.interface';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo,
  deleteUser,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map, Observable } from 'rxjs';
/**
 * @remarks
 * various ways to login and register with injected `RegistrationService` to help with with creation of data
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthStrategy {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth) {}

  initialize() {
    this.currentUserSubject.next(this.auth.currentUser);

    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      console.log(user ? `User logged in: ${user.uid}` : 'User logged out');
    });
  }

  login(): Promise<{ userId: string; isNewUser: boolean }> {
    throw new Error('Method not implemented.');
  }

  async deleteCurrentUser(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        // Delete the user from Firebase Authentication
        await deleteUser(currentUser);

        console.log('User deleted successfully');
      } else {
        console.warn('No currently authenticated user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // we do this here so to guarantee stuff is done and to not forget it
      // this.registration.registerUser(user);
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

  getCurrentUserId(): string | undefined {
    const user = this.auth.currentUser;
    // console.log('user: ' + user?.uid);
    return user ? user.uid : undefined;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): boolean {
    const isAuthenticated = !!this.currentUserSubject.getValue();
    return isAuthenticated;
  }

  isAuthenticatedObservable(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map((user) => !!user) // Map the user object to a boolean (true if user exists, false otherwise)
    );
  }

  async logOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendSignInLinkToEmail(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async confirmSignInWithEmail(url: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }> {
    if (this.isAuthenticated()) {
      console.log('User already logged in, skipping Google sign-in');
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        return { userId: currentUser.uid, isNewUser: false };
      }
      throw new Error('Authentication state inconsistency detected.');
    }

    try {
      console.log('Starting Google sign-in process...');
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes and settings for better compatibility
      provider.addScope('email');
      provider.addScope('profile');
      
      // Chrome-specific popup settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Attempting to open popup for Google authentication...');
      
      // Add timeout for popup
      const popupPromise = signInWithPopup(this.auth, provider);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Popup timeout - popup may be blocked')), 15000)
      );
      
      const userCredential = await Promise.race([popupPromise, timeoutPromise]) as any;
      console.log('Popup authentication successful, processing user data...');
      
      const user = userCredential.user;

      if (!user) {
        throw new Error('User not found in the user credential.');
      }

      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = additionalUserInfo?.isNewUser ?? false;

      console.log('Google authentication completed successfully', {
        userId: user.uid,
        email: user.email,
        isNewUser
      });

      if (isNewUser) {
        console.log(
          'Welcome aboard, space cadet! Performing first-time sign-in operations.'
        );
      } else {
        console.log('Welcome back, astronaut! Loading your dashboard.');
      }

      return { userId: user.uid, isNewUser: isNewUser };
    } catch (error) {
      console.error('Error during sign in with Google:', error);
      
      // Log specific popup-related errors and provide helpful user feedback
      if (error instanceof Error) {
        if (error.message.includes('popup') || error.message.includes('blocked')) {
          console.error('POPUP BLOCKED: Please enable popups for this site or use the redirect method');
          // Throw a specific error that the component can catch and show a nice message
          throw new Error('POPUP_BLOCKED');
        } else if (error.message.includes('network') || error.message.includes('offline')) {
          console.error('NETWORK ERROR: Check your internet connection');
          throw new Error('NETWORK_ERROR');
        } else if (error.message.includes('cancelled') || error.message.includes('closed')) {
          console.error('USER CANCELLED: User closed the popup or cancelled the authentication');
          throw new Error('USER_CANCELLED');
        }
      }
      
      throw error;
    }
  }

  async checkForRedirectResult(): Promise<{ userId: string; isNewUser: boolean } | null> {
    // Separate method to manually check for redirect results
    try {
      const redirectResult = await getRedirectResult(this.auth);
      if (redirectResult) {
        console.log('Processing redirect authentication result...');
        const user = redirectResult.user;
        const additionalUserInfo = getAdditionalUserInfo(redirectResult);
        const isNewUser = additionalUserInfo?.isNewUser ?? false;
        
        console.log('Redirect authentication successful', {
          userId: user.uid,
          email: user.email,
          isNewUser
        });
        
        return { userId: user.uid, isNewUser };
      }
      return null;
    } catch (error) {
      console.warn('Error checking redirect result:', error);
      return null;
    }
  }

  async loginWithGoogleRedirect(): Promise<{ userId: string; isNewUser: boolean }> {
    console.log('Using redirect method for Google authentication...');
    
    // First check if we're returning from a redirect
    const redirectResult = await this.checkForRedirectResult();
    if (redirectResult) {
      return redirectResult;
    }
    
    // If no redirect result, initiate the redirect
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // This will redirect the user to Google's OAuth page
    await signInWithRedirect(this.auth, provider);
    
    // This method will not return normally as the page redirects
    // The result will be handled when the user returns to the app
    throw new Error('Redirecting to Google authentication...');
  }

  loginWithYahoo(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  loginWithFacebook(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}
