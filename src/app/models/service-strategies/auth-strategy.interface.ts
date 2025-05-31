import { Observable } from 'rxjs';

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  isAnonymous?: boolean;
  emailVerified?: boolean;
  isNewUser?: boolean;
  // Add other common fields if needed
}

export interface AuthStrategy {
  isAuthenticated(): boolean;
  getCurrentUserId(): string | undefined;
  getCurrentUser(): Observable<AuthUser | null>; // firebase User or whatever... for now unknown...
  logOut(): Promise<void>;
  deleteCurrentUser(): void;
  login(): Promise<{ userId: string; isNewUser: boolean }>; // General login method, using it for testing really or offline mode...

  loginWithEmailAndPassword(email: string, password: string): Promise<void>;
  loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }>; // user id
  loginWithYahoo(): Promise<unknown>;
  loginWithFacebook(): Promise<unknown>;

  // passwordless
  sendSignInLinkToEmail(email: string): Promise<unknown>;
  confirmSignInWithEmail(url: string): Promise<unknown>;
}
