import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { firebaseAiApi } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiApiFirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  /** Observable that emits true when user is logged in to AI API, false otherwise */
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor() {
    // Initialize or retrieve the 'ai-api' Firebase app
    this.app = getApps().some((a) => a.name === 'ai-api')
      ? getApp('ai-api')
      : initializeApp(firebaseAiApi, 'ai-api');

    this.auth = getAuth(this.app);

    // Set up auth state listener to track login status
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.isLoggedInSubject.next(!!user);
      console.log('AiApiFirebaseService: Auth state changed, logged in:', !!user);
    });
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  /** Check if currently logged in to AI API (synchronous) */
  isCurrentlyLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Fire and forget login to AI API using Google auth.
   * This doesn't wait for the login to complete.
   * Use isLoggedIn$ Observable to track login status changes.
   */
  loginGoogle(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(() => {
        console.log('AiApiFirebaseService: Google login successful');
      })
      .catch((error) => {
        console.error('AiApiFirebaseService: Google login failed', error);
      });
  }

  /**
   * Wait for Google login to complete and resolve when done.
   * Useful when you need to ensure login is finished before proceeding.
   */
  async loginGoogleAndWait(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    const u = this.auth.currentUser;
    return u ? await u.getIdToken(forceRefresh) : null;
  }

  getUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
