import { NgModule } from '@angular/core';
import { GatewayComponent } from './gateway/gateway.component';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRouteMap } from '../../../app.routes-models';

// 'Login';
// 'Navigation Hub';
// 'Settings';
// 'Welcome Page';

const routes: Routes = [
  {
    path: '',
    component: GatewayComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'login',
      //   pathMatch: 'full',
      // },
      {
        path: 'login',
        component: LoginComponent, // Replace with your actual component
      },
      {
        path: 'settings',
        component: SettingsComponent, // Replace with your actual component
      },
    ],
    // login
    // home
    // settings
  },
];

export const gatewayRouteMetadata: AppRouteMap = {
  login: {
    title: 'Login',
    icon: 'template', // Replace with the appropriate icon
    description: 'Login Page.',
    altName: '',
  },
  settings: {
    title: 'Settings',
    icon: 'template', // Replace with the appropriate icon
    description: 'Modify settings.',
    altName: '',
  },
};
export const gatewayChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
