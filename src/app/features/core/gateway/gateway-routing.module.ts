import { NgModule } from '@angular/core';
import { GatewayComponent } from './gateway/gateway.component';
import { Routes, RouterModule } from '@angular/router';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

// 'Login';
// 'Navigation Hub';
// 'Settings';
// 'Welcome Page';

const routes: Routes = [
  {
    path: '',
    component: GatewayComponent,
    children: [
      {
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: ALL_APP_PATHS['login'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['login'],
      ALL_APP_PATHS['settings'],
    ],
    // login
    // home
    // settings
  },
];

export const gatewayChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewayRoutingModule {}
