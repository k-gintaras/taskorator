import { NgModule } from '@angular/core';
import { NexusComponent } from './nexus/nexus.component';
import { Routes, RouterModule } from '@angular/router';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

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
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: ALL_APP_PATHS['session'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['session'],
    ],
  },
];

export const nexusChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexusRoutingModule {}
