import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SentinelComponent } from './sentinel/sentinel.component';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';
import {
  canActivate,
  canActivateChild,
} from '../../../services/core/auth-guard';

// "Command Center"
// "Task Overview"
// "Prioritization"
// "Superview"

const routes: Routes = [
  {
    path: '',
    component: SentinelComponent,

    children: [
      {
        path: '', // Empty path, to handle default navigation to one of the child routes
        redirectTo: ALL_APP_PATHS['latestCreated'].path, // Redirect to the default child route
        pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
      },
      ALL_APP_PATHS['latestUpdated'],
      ALL_APP_PATHS['latestCreated'],
      ALL_APP_PATHS['dailyTasks'],
      ALL_APP_PATHS['weeklyTasks'],
      ALL_APP_PATHS['focusTasksList'],
      ALL_APP_PATHS['rootTasksList'],
    ],
  },
];

export const sentinelChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SentinelRoutingModule {}
