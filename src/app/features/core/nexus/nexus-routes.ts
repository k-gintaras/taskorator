import { NgModule } from '@angular/core';
import { NexusComponent } from './nexus/nexus.component';
import { Routes, RouterModule } from '@angular/router';
import { SessionComponent } from './session/session/session.component';
import { AppRouteMap } from '../../../app.routes-models';

// 'Task Planning';
// 'Session Management';
// 'Workflow Hub';
// 'Time-based Sessions';
const routes: Routes = [
  {
    path: '',
    component: NexusComponent,
    children: [
      {
        path: '',
        redirectTo: 'session',
        pathMatch: 'full',
      },
      {
        path: 'session',
        component: SessionComponent, // Replace with your actual component
      },
    ],
  },
];

export const nexusRouteMetadata: AppRouteMap = {
  session: {
    title: 'Session',
    icon: 'template', // Replace with the appropriate icon
    description: 'Start session to do certain tasks in certain time.',
    altName: '',
  },
};
export const nexusChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
