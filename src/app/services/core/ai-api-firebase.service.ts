import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

    // If the user was redirected back after a redirect sign-in, process the result
    getRedirectResult(this.auth)
      .then((result) => {
        if (result && result.user) {
          console.log('AiApiFirebaseService: Redirect sign-in completed for user', result.user.uid);
          sessionStorage.removeItem('aiApiRedirectInProgress');
        }
      })
      .catch((err) => {
        // Non-fatal: log and continue. Common when no redirect result exists.
        if (err && err.code !== 'auth/no-auth-event') {
          console.warn('AiApiFirebaseService: getRedirectResult error', err);
        }
        sessionStorage.removeItem('aiApiRedirectInProgress');
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
    // If already signed in, no need to open a popup/redirect
    if (this.auth.currentUser) {
      console.log('AiApiFirebaseService: Already logged in to AI API, skipping Google sign-in');
      return;
    }
    // Prevent repeated login attempts after redirect
    if (sessionStorage.getItem('aiApiRedirectInProgress')) {
      console.log('AiApiFirebaseService: Redirect in progress, skipping login');
      return;
    }
    signInWithPopup(this.auth, provider)
      .then(() => {
        console.log('AiApiFirebaseService: Google login successful');
      })
      .catch((error) => {
        const code = error && error.code ? error.code : '';
        console.error('AiApiFirebaseService: Google login failed with code:', code, error);
        
        // Domain not authorized - show clear error to user
        if (code === 'auth/unauthorized-domain') {
          console.error('AiApiFirebaseService: Current domain is not authorized in AI API Firebase Console');
          console.error('AiApiFirebaseService: Please add your domain to the authorized list in Firebase Console for project: ai-api-5c92d');
          this.isLoggedInSubject.next(false);
          return;
        }
        
        // Popup may be blocked by browser. Fall back to redirect sign-in.
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          console.log('AiApiFirebaseService: Popup blocked — falling back to redirect sign-in');
          sessionStorage.setItem('aiApiRedirectInProgress', '1');
          signInWithRedirect(this.auth, provider).catch((err) => {
            console.error('AiApiFirebaseService: signInWithRedirect failed', err);
            this.isLoggedInSubject.next(false);
          });
        }
      });
  }

  /**
   * Wait for Google login to complete and resolve when done.
   * Useful when you need to ensure login is finished before proceeding.
   */
  async loginGoogleAndWait(): Promise<void> {
    const provider = new GoogleAuthProvider();
    if (this.auth.currentUser) {
      console.log('AiApiFirebaseService: Already logged in to AI API, skipping Google sign-in');
      return;
    }
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error: any) {
      const code = error && error.code ? error.code : '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        console.log('AiApiFirebaseService: Popup blocked in loginGoogleAndWait — using redirect');
        // Note: signInWithRedirect will navigate away; awaiting it resolves immediately in most environments.
        await signInWithRedirect(this.auth, provider);
        return;
      }
      throw error;
    }
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
