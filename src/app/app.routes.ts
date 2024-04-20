import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ParentComponent } from './components/parent/parent.component';
import { TreeViewComponent } from './features/tree-view/tree-view.component';
import { TaskNavigatorComponent } from './features/task-navigator/task-navigator/task-navigator.component';
import { canActivate } from './services/core/auth-guard';

export const routes: Routes = [
  // { path: 'task-filter', component: TaskFilterComponent }, // Mass Editor, Filter
  // { path: 'overlord-browser', component: OverlordBrowserComponent }, // Various Lists
  // { path: 'task-view', component: TaskViewComponent }, // Task View
  // { path: 'filter-manager', component: FilterManagerComponent }, // Various Lists
  { path: 'vizualizer', component: TreeViewComponent }, // Vizualizer
  // { path: 'overlord-manager', component: OverlordManagerComponent }, // Overlord Swapper
  // { path: 'task-importance', component: TaskImportanceComponent }, // Task Importance
  // { path: 'input-to-tasks', component: InputToTasksComponent }, // Mass Add
  // { path: 'add-simple-task', component: AddSimpleTaskComponent }, // Add Simple Task
  // { path: 'task-browser', component: TaskBrowserComponent }, // same as TaskNavigatorComponent but sqlite
  { path: 'parent', component: ParentComponent }, // Task Browser
  // { path: 'firebase', component: TestFirebaseComponent },
  { path: '', redirectTo: '/protected', pathMatch: 'full' }, // Default route
  // { path: '**', redirectTo: '/parent' }, // Handle invalid routes
  // { path: 'error', component: AddSimpleTaskComponent }, // Handle invalid login routes
  { path: 'login', component: LoginComponent }, // Login
  {
    path: 'protected',
    component: TaskNavigatorComponent,
    canActivate: [canActivate],
  }, // Login Test
];
// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule],
// })
// export class AppRoutingModule {}
