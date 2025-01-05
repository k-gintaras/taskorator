import {
  CanActivateFn,
  UrlTree,
  CanActivateChildFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { AuthServiceTesting } from '../test-services/test-auth.service';
import { NavigationService } from '../navigation.service';

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService); // Inject the service
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated || state.url.includes('gateway')) {
    return true;
  } else {
    // Save the original URL
    navigationService.setRedirectUrl(state.url); // Save the intended URL
    return router.createUrlTree(['/gateway/login']);
  }
};

export const canActivateChild: CanActivateChildFn = canActivate;

export const canActivateTesting: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthServiceTesting);
  const router = inject(Router);
  const navigationService = inject(NavigationService); // Inject the service
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated || state.url.includes('gateway')) {
    return true;
  } else {
    // Save the original URL
    navigationService.setRedirectUrl(state.url); // Save the intended URL
    return router.createUrlTree(['/gateway/login']);
  }
};

export const canActivateChildTesting: CanActivateChildFn = canActivateTesting;
