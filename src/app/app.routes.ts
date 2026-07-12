import { Route } from '@angular/router';
import { CORE_APP_METADATA } from './app.routes-metadata';
import { canActivate, canActivateChild, canActivateAdmin } from './services/core/auth-guard';
import { rootGuard } from './services/core/root-guard';
import { AdminComponent } from './features/admin/admin/admin.component';
import { NextTaskManagerComponent } from './features/next-task-manager/next-task-manager.component';
import { TaskViewComponent } from './components/task/task-view/task-view.component';
import { AuthShellComponent } from './features/ui-factory/auth-shell/auth-shell.component';
import { RootPlaceholderComponent } from './components/root-placeholder/root-placeholder.component';
import { LoginComponent } from './features/core/gateway/login/login.component';
import { TaskNavigatorV2Component } from './components/task-navigator-v2/task-navigator-v2.component';
import { TestTaskTaggingComponent } from './components/test-task-tagging/test-task-tagging.component';

export const routes: Route[] = [
  {
    path: '',
    component: RootPlaceholderComponent,
    canActivate: [rootGuard],
    pathMatch: 'full',
  }, // Root guard handles auth-based redirect
  { path: 'welcome', redirectTo: '/gateway/welcome', pathMatch: 'full' }, // Redirect welcome to gateway/welcome

  { path: 'login', component: LoginComponent }, // Public login

  // Test route for new task navigator
  { path: 'test/navigator-v2', component: TaskNavigatorV2Component },
  { path: 'test/tagging', component: TestTaskTaggingComponent },

  {
    path: 'gateway',
    loadChildren: () =>
      import('./features/core/gateway/gateway-routes').then((m) => m.default),
    // No auth guard — public welcome area
  },
  // Protected shell: navigation + protected routes live under this guarded parent
  {
    path: '',
    component: AuthShellComponent,
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    children: [
      { path: 'next', component: NextTaskManagerComponent },
      { path: 'tasks/:taskId', component: TaskViewComponent },
      {
        path: 'citadel',
        loadChildren: () => import('./features/core/citadel/citadel-routes').then((m) => m.default),
        data: CORE_APP_METADATA['citadel'],
      },
      {
        path: 'crucible',
        loadChildren: () => import('./features/core/crucible/crucible-routes').then((m) => m.default),
        data: CORE_APP_METADATA['crucible'],
      },
      {
        path: 'dreamforge',
        loadChildren: () => import('./features/core/dreamforge/dreamforge-routes').then((m) => m.default),
        data: CORE_APP_METADATA['dreamforge'],
      },
      {
        path: 'gateway',
        loadChildren: () => import('./features/core/gateway/gateway-routes').then((m) => m.default),
        data: CORE_APP_METADATA['gateway'],
      },
      {
        path: 'nexus',
        loadChildren: () => import('./features/core/nexus/nexus-routes').then((m) => m.default),
        data: CORE_APP_METADATA['nexus'],
      },
      {
        path: 'sentinel',
        loadChildren: () => import('./features/core/sentinel/sentinel-routes').then((m) => m.default),
        data: CORE_APP_METADATA['sentinel'],
      },
      {
        path: 'vortex',
        loadChildren: () => import('./features/core/vortex/vortex-routes').then((m) => m.default),
        data: CORE_APP_METADATA['vortex'],
      },
      { path: 'admin', component: AdminComponent, canActivate: [canActivateAdmin] },
    ],
  },
  { path: '**', redirectTo: '/gateway/welcome' },
];

