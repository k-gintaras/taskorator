import { CanActivateFn, UrlTree, CanActivateChildFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const canActivate: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Convert boolean to Observable if isAuthenticated returns a boolean
  const isAuthenticated$ = of(authService.isAuthenticated());

  return isAuthenticated$.pipe(
    map((isAuthenticated) =>
      isAuthenticated || router.url.includes('gateway')
        ? true
        : router.createUrlTree(['/gateway/login'])
    ),
    catchError(() => of(router.createUrlTree(['/error'])))
  );
};

export const canActivateChild: CanActivateChildFn = canActivate;
