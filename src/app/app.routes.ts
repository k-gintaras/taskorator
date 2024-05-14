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
  }, // Login Test
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [canActivate],
  }, // Login Test
  {
    path: 'suggestions',
    component: GptTasksComponent,
    canActivate: [canActivate],
  }, // Login Test
  {
    path: 'focus',
    component: FocusComponent,
    canActivate: [canActivate],
  }, // Login Test
  {
    path: 'sentinel',
    component: SentinelComponent,
    canActivate: [canActivate],
  }, // Login Test

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
