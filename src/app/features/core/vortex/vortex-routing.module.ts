import { NgModule } from '@angular/core';
import { VortexComponent } from './vortex/vortex.component';
import { Routes, RouterModule } from '@angular/router';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

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
        redirectTo: ALL_APP_PATHS['vizualizer'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['vizualizer'],
    ],
  },
];

export const vortexChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VortexRoutingModule {}
