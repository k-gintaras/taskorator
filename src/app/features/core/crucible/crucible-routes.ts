import { NgModule } from '@angular/core';
import { CrucibleComponent } from './crucible/crucible.component';
import { Routes, RouterModule } from '@angular/router';
import { SearchOverlordComponent } from '../../../components/search-overlord/search-overlord.component';
import { SelectedMultipleComponent } from './selected-multiple/selected-multiple.component';
import { InputToTasksComponent } from './input-to-tasks/input-to-tasks/input-to-tasks.component';
import { AppRouteMap } from '../../../app.routes-models';

// 'Task Group Actions';
// 'Task Refinement';
// 'Batch Operations';
// 'Selected Tasks';
// A focused area for refining and executing group actions on selected tasks.

const routes: Routes = [
  {
    path: '',
    component: CrucibleComponent,
    children: [
      {
        path: '',
        redirectTo: 'selected',
        pathMatch: 'full',
      },
      {
        path: 'selected',
        component: SelectedMultipleComponent, // Replace with your actual component
      },
      {
        path: 'searchOverlord',
        component: SearchOverlordComponent, // Replace with your actual component
      },
      {
        path: 'massAdd',
        component: InputToTasksComponent, // Replace with your actual component
      },
    ],
  },
];

export const crucibleRouteMetadata: AppRouteMap = {
  selected: {
    title: 'SelectedTasks',
    icon: 'template', // Replace with the appropriate icon
    description: 'Manage selected tasks.',
    altName: '',
  },
  searchOverlord: {
    title: 'Search Overlord',
    icon: 'template', // Replace with the appropriate icon
    description: 'Search overlord.',
    altName: '',
  },
  massAdd: {
    title: 'Mass Add',
    icon: 'template', // Replace with the appropriate icon
    description: 'Add many tasks at the same time.',
    altName: '',
  },
};

export const crucibleChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
