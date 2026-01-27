import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateManagerService } from '../auth-state-manager.service';
import { NAVIGATION_CONFIG } from '../../app.config';

/**
 * Root guard: Smart redirect for authenticated users
 * - If logged in: redirect to dashboard
 * - If not logged in: allow welcome page to load
 */
export const rootGuard: CanActivateFn = async (route, state) => {
  const authState = inject(AuthStateManagerService);
  const router = inject(Router);

  try {
    // Wait for auth state to initialize
    await authState.ensureInitialized();
    
    if (authState.isAuthenticated()) {
      // User is authenticated - redirect to dashboard
      console.log('RootGuard: User authenticated, redirecting to dashboard');
      router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
      return false; // Don't allow root route to load
    }
    
    // User not authenticated - redirect to welcome
    console.log('RootGuard: User not authenticated, redirecting to welcome');
    router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
    return false;
  } catch (error) {
    console.error('RootGuard: Error checking auth state:', error);
    // On error, redirect to welcome (fail open)
    router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
    return false;
  }
};
