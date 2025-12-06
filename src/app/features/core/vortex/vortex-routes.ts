import { NgModule } from '@angular/core';
import { VortexComponent } from './vortex/vortex.component';
import { Routes, RouterModule } from '@angular/router';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { TreeRepairComponent } from '../../admin/tree-repair/tree-repair.component';
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
      {
        path: 'repair',
        component: TreeRepairComponent,
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
  repair: {
    title: 'Tree Repair',
    icon: 'build',
    description: 'Repair and maintain the task tree structure.',
    altName: 'Fix Tree',
  },
};
export const vortexChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
