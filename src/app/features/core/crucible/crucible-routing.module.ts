import { NgModule } from '@angular/core';
import { CrucibleComponent } from './crucible/crucible.component';
import { Routes, RouterModule } from '@angular/router';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

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
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: ALL_APP_PATHS['selected'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['selected'],
      ALL_APP_PATHS['searchOverlord'],
    ],
  },
];

export const crucibleChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrucibleRoutingModule {}
