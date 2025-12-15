import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DreamforgeComponent } from './dreamforge/dreamforge.component';
import { CreateRepetitiveTaskComponent } from './create-repetitive-task/create-repetitive-task.component';
import { CreateSpecializedTaskComponent } from './create-specialized-task/create-specialized-task.component';
import { FavoriteTaskComponent } from './favorite/favorite-task/favorite-task.component';
import { FocusComponent } from './focus/focus/focus.component';
import { FrogTaskComponent } from './frog/frog-task/frog-task.component';
import { LastActionViewerComponent } from '../../../components/last-action-viewer/last-action-viewer.component';
import { AppRouteMap } from '../../../app.routes-models';

// 'Task Creation';
// 'Creative Tools';
// 'Specialization Tools';
// 'Task Refinement';

const routes: Routes = [
  {
    path: '',
    component: DreamforgeComponent,
    children: [
      {
        path: '',
        redirectTo: 'focus',
        pathMatch: 'full',
      },
      {
        path: 'focus',
        component: FocusComponent, // Replace with your actual component
      },
      {
        path: 'frog',
        component: FrogTaskComponent, // Replace with your actual component
      },
      {
        path: 'favorite',
        component: FavoriteTaskComponent, // Replace with your actual component
      },
      {
        path: 'createRepetitive',
        component: CreateRepetitiveTaskComponent, // Replace with your actual component
      },
      {
        path: 'createSpecialized',
        component: CreateSpecializedTaskComponent, // Replace with your actual component
      },
      {
        path: 'lastAction',
        component: LastActionViewerComponent,
      },
    ],
    // create task tagger
    //
  },
];
export const dreamforgeRouteMetadata: AppRouteMap = {
  focus: {
    title: 'Focus Tasks',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create focus tasks.',
    altName: '',
  },
  frog: {
    title: 'Frog Tasks',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create frog tasks.',
    altName: '',
  },
  favorite: {
    title: 'Favorite Tasks',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create favorite tasks.',
    altName: '',
  },
  createRepetitive: {
    title: 'Create Repetitive',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create repetitive tasks.',
    altName: '',
  },
  createSpecialized: {
    title: 'Create Specialized',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create specialized tasks by type.',
    altName: '',
  },
  lastAction: {
    title: 'Last Action',
    icon: 'history',
    description: 'View and undo the last action performed.',
    altName: 'Undo',
  },
};
export const dreamforgeChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
