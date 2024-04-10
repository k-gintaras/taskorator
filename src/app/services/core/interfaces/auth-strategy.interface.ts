import { ApiStrategy } from './api-strategy.interface';
import { CacheStrategy } from './cache-strategy.interface';

export interface AuthStrategy {
  isAuthenticated(): boolean;
  getCurrentUserId(): Promise<string | undefined>;
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
