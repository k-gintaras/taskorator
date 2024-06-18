import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ParentComponent } from './components/parent/parent.component';
import { TreeViewComponent } from './features/tree-view/tree-view.component';
import { TaskNavigatorComponent } from './features/task-navigator/task-navigator/task-navigator.component';
import { canActivate } from './services/core/auth-guard';
import { SelectedMultipleComponent } from './components/task/selected-multiple/selected-multiple.component';
import { AdminComponent } from './features/admin/admin/admin.component';
import { GptTasksComponent } from './features/gpt/gpt-tasks/gpt-tasks.component';
import { FocusComponent } from './features/focus/focus/focus.component';
import { SentinelComponent } from './features/sentinel/sentinel/sentinel.component';
import { SessionComponent } from './features/session/session/session.component';
import { TemplateHandlerComponent } from './features/template/template-handler/template-handler.component';
import { FrogTaskComponent } from './features/frog/frog-task/frog-task.component';
import { FavoriteTaskComponent } from './features/favorite/favorite-task/favorite-task.component';

export const routes: Routes = [
  {
    path: 'vizualizer',
    component: TreeViewComponent,
    canActivate: [canActivate],
  }, // Vizualizer
  { path: 'parent', component: ParentComponent }, // Task Browser
  { path: '', redirectTo: '/navigator', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponent }, // Login
  {
    path: 'selected',
    component: SelectedMultipleComponent,
    canActivate: [canActivate],
  }, // Login
  {
    path: 'navigator',
    component: TaskNavigatorComponent,
    canActivate: [canActivate],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [canActivate],
  },
  {
    path: 'suggestions',
    component: GptTasksComponent,
    canActivate: [canActivate],
  },
  {
    path: 'focus',
    component: FocusComponent,
    canActivate: [canActivate],
  },
  {
    path: 'sentinel',
    component: SentinelComponent,
    canActivate: [canActivate],
  },
  {
    path: 'session',
    component: SessionComponent,
    canActivate: [canActivate],
  },
  {
    path: 'template',
    component: TemplateHandlerComponent,
    canActivate: [canActivate],
  },
  {
    path: 'frog',
    component: FrogTaskComponent,
    canActivate: [canActivate],
  },
  {
    path: 'favorite',
    component: FavoriteTaskComponent,
    canActivate: [canActivate],
  },
  {
    path: 'test',
    component: FavoriteTaskComponent,
    canActivate: [canActivate],
  },

  // { path: 'task-filter', component: TaskFilterComponent }, // Mass Editor, Filter
  // { path: 'overlord-browser', component: OverlordBrowserComponent }, // Various Lists
  // { path: 'task-view', component: TaskViewComponent }, // Task View
  // { path: 'filter-manager', component: FilterManagerComponent }, // Various Lists
  // { path: 'overlord-manager', component: OverlordManagerComponent }, // Overlord Swapper
  // { path: 'task-importance', component: TaskImportanceComponent }, // Task Importance
  // { path: 'input-to-tasks', component: InputToTasksComponent }, // Mass Add
  // { path: 'add-simple-task', component: AddSimpleTaskComponent }, // Add Simple Task
  // { path: 'task-browser', component: TaskBrowserComponent }, // same as TaskNavigatorComponent but sqlite
  // { path: 'firebase', component: TestFirebaseComponent },
  // { path: '**', redirectTo: '/parent' }, // Handle invalid routes
  // { path: 'error', component: AddSimpleTaskComponent }, // Handle invalid login routes
];
