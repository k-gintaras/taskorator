import { Route } from '@angular/router';
import { CORE_APP_METADATA } from './app.routes-metadata';
import {
  canActivate,
  canActivateChild,
  canActivateChildTesting,
  canActivateTesting,
} from './services/core/auth-guard';

export const routes: Route[] = [
  {
    path: 'citadel',
    loadChildren: () =>
      import('./features/core/citadel/citadel-routes').then((m) => m.default),
    data: CORE_APP_METADATA['citadel'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  {
    path: 'crucible',
    loadChildren: () =>
      import('./features/core/crucible/crucible-routes').then((m) => m.default),
    data: CORE_APP_METADATA['crucible'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  {
    path: 'dreamforge',
    loadChildren: () =>
      import('./features/core/dreamforge/dreamforge-routes').then(
        (m) => m.default
      ),
    data: CORE_APP_METADATA['dreamforge'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  {
    path: 'gateway',
    loadChildren: () =>
      import('./features/core/gateway/gateway-routes').then((m) => m.default),
    data: CORE_APP_METADATA['gateway'], // Attach metadata for navigator
    // canActivate: [canActivate],
    // canActivateChild: [canActivateChild],
  },
  {
    path: 'nexus',
    loadChildren: () =>
      import('./features/core/nexus/nexus-routes').then((m) => m.default),
    data: CORE_APP_METADATA['nexus'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  {
    path: 'sentinel',
    loadChildren: () =>
      import('./features/core/sentinel/sentinel-routes').then((m) => m.default),
    data: CORE_APP_METADATA['sentinel'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  {
    path: 'vortex',
    loadChildren: () =>
      import('./features/core/vortex/vortex-routes').then((m) => m.default),
    data: CORE_APP_METADATA['vortex'], // Attach metadata for navigator
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
  },
  { path: '', redirectTo: 'gateway', pathMatch: 'full' },
  { path: '**', redirectTo: 'gateway' },
];
