export interface AuthStrategy {
  isAuthenticated(): boolean;
  getCurrentUserId(): Promise<string | undefined>;
  logOut(): Promise<void>;
  loginWithEmailAndPassword(email: string, password: string): Promise<void>;

  // other
  loginWithGoogle(): Promise<unknown>;
  loginWithYahoo(): Promise<unknown>;
  loginWithFacebook(): Promise<unknown>;

  // passwordless
  sendSignInLinkToEmail(email: string): Promise<unknown>;
  confirmSignInWithEmail(url: string): Promise<unknown>;
}
