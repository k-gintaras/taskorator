import { Routes } from '@angular/router';
import { SentinelComponent } from './sentinel/sentinel.component';
import { DailyTaskListComponent } from './lists/daily-task-list/daily-task-list.component';
import { FocusTaskListComponent } from './lists/focus-task-list/focus-task-list.component';
import { WeeklyTaskListComponent } from './lists/weekly-task-list/weekly-task-list.component';
import { RootTaskListComponent } from './lists/root-task-list/root-task-list.component';
import { LatestCreatedTaskListComponent } from './lists/latest-created-task-list/latest-created-task-list.component';
import { LatestUpdatedTaskListComponent } from './lists/latest-updated-task-list/latest-updated-task-list.component';
import { AppRouteMap } from '../../../app.routes-models';
import { TaskViewComponent } from '../../../components/task/task-view/task-view.component';

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
        path: '',
        redirectTo: 'latestCreated',
        pathMatch: 'full',
      },
      {
        path: 'latestCreated',
        component: LatestCreatedTaskListComponent,
      },
      {
        path: 'latestCreated/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'latestCreated',
          taskListType: 'LATEST_CREATED',
        },
      },
      {
        path: 'latestUpdated',
        component: LatestUpdatedTaskListComponent,
      },
      {
        path: 'latestUpdated/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'latestUpdated',
          taskListType: 'LATEST_UPDATED',
        },
      },
      {
        path: 'dailyTasks',
        component: DailyTaskListComponent,
      },
      {
        path: 'dailyTasks/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'dailyTasks',
          taskListType: 'DAILY',
        },
      },
      {
        path: 'weeklyTasks',
        component: WeeklyTaskListComponent,
      },
      {
        path: 'weeklyTasks/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'weeklyTasks',
          taskListType: 'WEEKLY',
        },
      },
      {
        path: 'focusTasksList',
        component: FocusTaskListComponent,
      },
      {
        path: 'focusTasksList/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'focusTasksList',
          taskListType: 'FOCUS',
        },
      },
      {
        path: 'rootTasksList',
        component: RootTaskListComponent,
      },
      {
        path: 'rootTasksList/tasks/:taskId',
        component: TaskViewComponent,
        data: {
          listContext: 'rootTasksList',
          taskListType: 'OVERLORD',
        },
      },
    ],
  },
];

export const sentinelRouteMetadata: AppRouteMap = {
  latestCreated: {
    title: 'Latest Created Tasks',
    icon: 'add_task',
    description: 'View and manage tasks created recently.',
    altName: 'New Tasks',
  },
  latestUpdated: {
    title: 'Latest Updated Tasks',
    icon: 'update',
    description: 'View and manage tasks updated recently.',
    altName: 'Updated Tasks',
  },
  dailyTasks: {
    title: 'Daily Tasks',
    icon: 'calendar_today',
    description: 'View and manage your tasks for today.',
    altName: "Today's Tasks",
  },
  weeklyTasks: {
    title: 'Weekly Tasks',
    icon: 'date_range',
    description: 'View and manage your tasks for this week.',
    altName: "This Week's Tasks",
  },
  focusTasksList: {
    title: 'Focus Tasks',
    icon: 'visibility',
    description: 'View and manage tasks that need your attention.',
    altName: 'Focused Tasks',
  },
  rootTasksList: {
    title: 'Root Tasks',
    icon: 'account_tree',
    description: 'View and manage the root-level tasks.',
    altName: 'Root Tasks',
  },
};

export const sentinelChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
