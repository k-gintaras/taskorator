import { NgModule } from '@angular/core';
import { GatewayComponent } from './gateway/gateway.component';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { AppRouteMap } from '../../../app.routes-models';
import { NextTaskManagerComponent } from '../../next-task-manager/next-task-manager.component';

// 'Login';
// 'Navigation Hub';
// 'Settings';
// 'Welcome Page';

const routes: Routes = [
  // TODO: after enabling offline mode properly, please add intro, guide and so so (not really needed for myself, but for others)
  {
    path: '',
    component: GatewayComponent,
    children: [
      // children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      // { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      // { path: 'welcome', component: WelcomeComponent },
      // { path: 'features', component: FeaturesComponent },
      // { path: 'about', component: AboutComponent },
      // { path: 'guide', component: AppGuideComponent },
      {
        path: 'login',
        component: LoginComponent, // Replace with your actual component
      },
      {
        path: 'settings',
        component: SettingsComponent, // Replace with your actual component
      },
      {
        path: 'next',
        component: NextTaskManagerComponent, // Replace with your actual component
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
  next: {
    title: 'Next Task',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create task that we should focus next.',
    altName: 'Next',
  },
};
export const gatewayChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
