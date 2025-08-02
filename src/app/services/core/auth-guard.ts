import {
  CanActivateFn,
  UrlTree,
  CanActivateChildFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateManagerService } from '../auth-state-manager.service';
import { NavigationService } from '../navigation.service';

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authStateManager = inject(AuthStateManagerService);
  const navigationService = inject(NavigationService);

  return (async () => {
    try {
      // This will:
      // 1. Check if already initialized -> return immediately
      // 2. Check if user is authenticated in Firebase/localStorage -> initialize session
      // 3. If not authenticated -> return without initializing
      await authStateManager.ensureInitialized();

      // Now check if user is authenticated after ensuring initialization
      if (authStateManager.isAuthenticated()) {
        return true;
      }

      // Not authenticated - save the intended URL for redirect after login
      navigationService.setRedirectUrl(state.url);
      return router.createUrlTree(['/gateway/login']);
      
    } catch (error) {
      console.error('Auth guard error:', error);
      // On any error, still save the URL and redirect to login
      navigationService.setRedirectUrl(state.url);
      return router.createUrlTree(['/gateway/login']);
    }
  })();
};

export const canActivateChild: CanActivateChildFn = canActivate;
