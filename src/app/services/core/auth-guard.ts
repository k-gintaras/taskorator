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

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  // Handle navigation logic
  if (isAuthenticated || state.url.includes('gateway')) {
    return true;
  } else {
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

  const isAuthenticated = authService.isAuthenticated();

  // Handle navigation logic
  if (isAuthenticated || state.url.includes('gateway')) {
    return true;
  } else {
    return router.createUrlTree(['/gateway/login']);
  }
};

export const canActivateChildTesting: CanActivateChildFn = canActivateTesting;
