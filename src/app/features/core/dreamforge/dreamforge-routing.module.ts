import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DreamforgeComponent } from './dreamforge/dreamforge.component';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

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
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: ALL_APP_PATHS['focus'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['focus'],
      ALL_APP_PATHS['frog'],
      ALL_APP_PATHS['favorite'],
    ],
    // create task tagger
    //
  },
];

export const dreamforgeChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DreamforgeRoutingModule {}
