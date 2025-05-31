import {
  CanActivateFn,
  UrlTree,
  CanActivateChildFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { NavigationService } from '../navigation.service';
import { SessionManagerService } from '../session-manager.service';
import { AuthOfflineService } from './auth-offline.service';

// export const canActivate: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ): boolean | UrlTree => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const navigationService = inject(NavigationService); // Inject the service
//   const isAuthenticated = authService.isAuthenticated();

//   if (isAuthenticated || state.url.includes('gateway')) {
//     return true;
//   } else {
//     // Save the original URL
//     navigationService.setRedirectUrl(state.url); // Save the intended URL
//     return router.createUrlTree(['/gateway/login']);
//   }
// };

// export const canActivate: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ): boolean | UrlTree => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const navigationService = inject(NavigationService);

//   const isAuthenticated = authService.isAuthenticated();

//   if (isAuthenticated) {
//     return true;
//   }

//   navigationService.setRedirectUrl(state.url);
//   return router.createUrlTree(['/gateway/login']);
// };
export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const navigationService = inject(NavigationService);
  const sessionManager = inject(SessionManagerService);
  const authServiceOnline = inject(AuthService);
  const authServiceOffline = inject(AuthOfflineService);

  return (async () => {
    await sessionManager.waitForInitialization();
    const authService =
      sessionManager.getSessionType() === 'online'
        ? authServiceOnline
        : authServiceOffline;

    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
      return true;
    }

    navigationService.setRedirectUrl(state.url);
    return router.createUrlTree(['/gateway/login']);
  })();
};

export const canActivateChild: CanActivateChildFn = canActivate;
