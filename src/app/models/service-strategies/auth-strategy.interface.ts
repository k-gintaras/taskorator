import { Observable } from 'rxjs';
export interface AuthStrategy {
  isAuthenticated(): boolean;
  getCurrentUserId(): Promise<string | undefined>;
  getCurrentUser(): Observable<unknown | undefined>; // firebase User or whatever... for now unknown...
  logOut(): Promise<void>;
  deleteCurrentUser(): void;

  loginWithEmailAndPassword(email: string, password: string): Promise<void>;
  loginWithGoogle(): Promise<{ userId: string; isNewUser: boolean }>; // user id
  loginWithYahoo(): Promise<unknown>;
  loginWithFacebook(): Promise<unknown>;

  // passwordless
  sendSignInLinkToEmail(email: string): Promise<unknown>;
  confirmSignInWithEmail(url: string): Promise<unknown>;
}
