import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SentinelComponent } from './sentinel/sentinel.component';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';
import {
  canActivate,
  canActivateChild,
} from '../../../services/core/auth-guard';
import { DailyTaskListComponent } from './lists/daily-task-list/daily-task-list.component';
import { FocusTaskListComponent } from './lists/focus-task-list/focus-task-list.component';
import { WeeklyTaskListComponent } from './lists/weekly-task-list/weekly-task-list.component';
import { RootTaskListComponent } from './lists/root-task-list/root-task-list.component';
import { LatestCreatedTaskListComponent } from './lists/latest-created-task-list/latest-created-task-list.component';
import { LatestUpdatedTaskListComponent } from './lists/latest-updated-task-list/latest-updated-task-list.component';

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
      ALL_APP_PATHS['latestCreated'],
      ALL_APP_PATHS['latestUpdated'],
      ALL_APP_PATHS['dailyTasks'],
      ALL_APP_PATHS['weeklyTasks'],
      ALL_APP_PATHS['focusTasksList'],
      ALL_APP_PATHS['rootTasksList'],
      // { path: 'focus', component: FocusTaskListComponent },
      // { path: 'weekly', component: WeeklyTaskListComponent },
      // { path: 'root', component: RootTaskListComponent },
      // { path: 'created', component: LatestCreatedTaskListComponent },
      // { path: 'updated', component: LatestUpdatedTaskListComponent },
      // Add additional routes here
    ],
    // children: [
    //   {
    //     path: '', // Empty path, to handle default navigation to one of the child routes
    //     redirectTo: ALL_APP_PATHS['latestCreated'].path, // Redirect to the default child route
    //     pathMatch: 'full', // This ensures that the redirect happens when the path is exactly empty
    //   },
    //   ALL_APP_PATHS['latestUpdated'],
    //   ALL_APP_PATHS['latestCreated'],
    //   ALL_APP_PATHS['dailyTasks'],
    //   ALL_APP_PATHS['weeklyTasks'],
    //   ALL_APP_PATHS['focusTasksList'],
    //   ALL_APP_PATHS['rootTasksList'],
    // ],
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
