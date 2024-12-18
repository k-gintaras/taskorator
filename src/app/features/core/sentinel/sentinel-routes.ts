import { Routes } from '@angular/router';
import { SentinelComponent } from './sentinel/sentinel.component';
import { DailyTaskListComponent } from './lists/daily-task-list/daily-task-list.component';
import { FocusTaskListComponent } from './lists/focus-task-list/focus-task-list.component';
import { WeeklyTaskListComponent } from './lists/weekly-task-list/weekly-task-list.component';
import { RootTaskListComponent } from './lists/root-task-list/root-task-list.component';
import { LatestCreatedTaskListComponent } from './lists/latest-created-task-list/latest-created-task-list.component';
import { LatestUpdatedTaskListComponent } from './lists/latest-updated-task-list/latest-updated-task-list.component';
import { AppRouteMap } from '../../../app.routes-models';

// "Command Center"
// "Task Overview"
// "Prioritization"
// "Superview"

const routes: Routes = [
  {
    path: '',
    component: SentinelComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'latestCreated',
      //   pathMatch: 'full',
      // },
      {
        path: 'latestCreated',
        component: LatestCreatedTaskListComponent, // Replace with your actual component
      },
      {
        path: 'latestUpdated',
        component: LatestUpdatedTaskListComponent, // Replace with your actual component
      },
      {
        path: 'dailyTasks',
        component: DailyTaskListComponent, // Replace with your actual component
      },
      {
        path: 'weeklyTasks',
        component: WeeklyTaskListComponent, // Replace with your actual component
      },
      {
        path: 'focusTasksList',
        component: FocusTaskListComponent, // Replace with your actual component
      },
      {
        path: 'rootTasksList',
        component: RootTaskListComponent, // Replace with your actual component
      },
    ],
  },
];
export const sentinelRouteMetadata: AppRouteMap = {
  latestCreated: {
    title: 'Latest Created Tasks',
    icon: 'add_task', // Icon for newly created tasks
    description: 'View and manage tasks created recently.',
    altName: 'New Tasks',
  },
  latestUpdated: {
    title: 'Latest Updated Tasks',
    icon: 'update', // Icon for recently updated tasks
    description: 'View and manage tasks updated recently.',
    altName: 'Updated Tasks',
  },
  dailyTasks: {
    title: 'Daily Tasks',
    icon: 'calendar_today', // Icon for daily tasks
    description: 'View and manage your tasks for today.',
    altName: "Today's Tasks",
  },
  weeklyTasks: {
    title: 'Weekly Tasks',
    icon: 'date_range', // Icon for weekly tasks
    description: 'View and manage your tasks for this week.',
    altName: "This Week's Tasks",
  },
  focusTasksList: {
    title: 'Focus Tasks',
    icon: 'visibility', // Icon for focus tasks
    description: 'View and manage tasks that need your attention.',
    altName: 'Focused Tasks',
  },
  rootTasksList: {
    title: 'Root Tasks',
    icon: 'account_tree', // Icon for root task management
    description: 'View and manage the root-level tasks.',
    altName: 'Root Tasks',
  },
};

export const sentinelChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
