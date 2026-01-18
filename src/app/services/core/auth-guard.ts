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
import { SessionManagerService } from '../session-manager.service';

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

export const canActivateAdmin: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authStateManager = inject(AuthStateManagerService);
  const navigationService = inject(NavigationService);
  const sessionManager = inject(SessionManagerService);

  return (async () => {
    try {
      await authStateManager.ensureInitialized();

      if (!authStateManager.isAuthenticated()) {
        navigationService.setRedirectUrl(state.url);
        return router.createUrlTree(['/gateway/login']);
      }

      // Get current user id and then load user info via API strategy
      const authStrategy = sessionManager.getAuthStrategy();
      const userId = await authStrategy.getCurrentUserId();
      if (!userId) {
        navigationService.setRedirectUrl(state.url);
        return router.createUrlTree(['/gateway/login']);
      }

      const api = sessionManager.getApiStrategy();
      if (!api || typeof api.getUserInfo !== 'function') {
        // If API isn't available, deny access
        return router.createUrlTree(['/gateway/unauthorized']);
      }

      const userInfo: any = await api.getUserInfo();
      if (userInfo && userInfo.role === 'admin') {
        return true;
      }

      // Not an admin - redirect to unauthorized page
      return router.createUrlTree(['/gateway/unauthorized']);
    } catch (error) {
      console.error('Admin guard error:', error);
      navigationService.setRedirectUrl(state.url);
      return router.createUrlTree(['/gateway/unauthorized']);
    }
  })();
};
