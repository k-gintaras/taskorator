import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DreamforgeComponent } from './dreamforge/dreamforge.component';
import { CreateRepetitiveTaskComponent } from './create-repetitive-task/create-repetitive-task.component';
import { FavoriteTaskComponent } from './favorite/favorite-task/favorite-task.component';
import { FocusComponent } from './focus/focus/focus.component';
import { FrogTaskComponent } from './frog/frog-task/frog-task.component';
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
};
export const dreamforgeChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
