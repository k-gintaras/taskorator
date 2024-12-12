import { NgModule } from '@angular/core';
import { VortexComponent } from './vortex/vortex.component';
import { Routes, RouterModule } from '@angular/router';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { AppRouteMap } from '../../../app.routes-models';

// 'Task Visualization';
// 'Interactive Visuals';
// 'Task Representation';
// 'Dynamic Views';

const routes: Routes = [
  {
    path: '',
    component: VortexComponent,
    children: [
      {
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: 'vizualizer', // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      {
        path: 'vizualizer',
        component: TreeViewComponent, // Replace with your actual component
      },
    ],
  },
];
export const vortexRouteMetadata: AppRouteMap = {
  vizualizer: {
    title: 'Tree View',
    icon: 'template', // Replace with the appropriate icon
    description: 'View tasks as a tree.',
    altName: '',
  },
};
export const vortexChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
