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
  deleteUser,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { RegistrationService } from './registration.service';
import { deleteDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
/**
 * @remarks
 * various ways to login and register with injected `RegistrationService` to help with with creation of data
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthStrategy {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth, private registration: RegistrationService) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUserSubject.next(user);
        console.log('User is logged in:', user.uid);
      } else {
        this.currentUserSubject.next(null);
        console.log('User is not logged in');
      }
    });
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
    console.log('user: ' + user?.uid);
    return user ? user.uid : undefined;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.getValue();
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

  async loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }> {
    if (this.isAuthenticated()) {
      console.log('User already logged in, skipping Google sign-in');
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        return { userId: currentUser.uid, isNewUser: false }; // Assume false as they are already logged in
      }
      throw new Error('Authentication state inconsistency detected.');
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;

      if (!user) {
        throw new Error('User not found in the user credential.');
      }

      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = additionalUserInfo?.isNewUser ?? false; // Default to false if undefined

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
      throw error;
    }
  }

  // async loginWithGoogle(): Promise<void> {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const user = await signInWithPopup(this.auth, provider);

  //     // Use getAdditionalUserInfo to check for new user
  //     const additionalUserInfo = getAdditionalUserInfo(user);
  //     const isNewUser = additionalUserInfo?.isNewUser;

  //     if (isNewUser) {
  //       console.log(
  //         'Welcome aboard, space cadet! Performing first-time sign-in operations.'
  //       );
  //       this.registration.registerUser(user);
  //     } else {
  //       console.log('Welcome back, astronaut! Loading your dashboard.');
  //       // Handle returning user logic
  //     }
  //   } catch (error) {
  //     console.error('Error during sign in with Google:', error);
  //   }
  // }

  loginWithYahoo(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  loginWithFacebook(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
}
