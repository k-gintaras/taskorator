import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddSimpleTaskComponent } from './add-simple-task/add-simple-task.component';
import { InputToTasksComponent } from './input-to-tasks/input-to-tasks.component';
import { TaskImportanceComponent } from './task-importance/task-importance.component';
import { TaskViewComponent } from './task-view/task-view.component';
import { OverlordManagerComponent } from './components/overlord-manager/overlord-manager.component';
import { D3VizualizerComponent } from './components/d3-vizualizer/d3-vizualizer.component';
import { FilterManagerComponent } from './components/filter-manager/filter-manager.component';
import { OverlordBrowserComponent } from './components/overlord-browser/overlord-browser.component';
import { TaskFilterComponent } from './components/task-filter/task-filter.component';
import { TaskBrowserComponent } from './components/task-browser/task-browser.component';
import { ParentComponent } from './components/parent/parent.component';
import { TestFirebaseComponent } from './components/test-firebase/test-firebase.component';
import { canActivate } from './services/core/auth-guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TaskNavigatorComponent } from './components/task-navigator/task-navigator.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';

const routes: Routes = [
  { path: 'task-filter', component: TaskFilterComponent }, // Mass Editor, Filter
  { path: 'overlord-browser', component: OverlordBrowserComponent }, // Various Lists
  { path: 'task-view', component: TaskViewComponent }, // Task View
  { path: 'filter-manager', component: FilterManagerComponent }, // Various Lists
  { path: 'd3-vizualizer', component: TreeViewComponent }, // Vizualizer
  { path: 'overlord-manager', component: OverlordManagerComponent }, // Overlord Swapper
  { path: 'task-importance', component: TaskImportanceComponent }, // Task Importance
  { path: 'input-to-tasks', component: InputToTasksComponent }, // Mass Add
  { path: 'add-simple-task', component: AddSimpleTaskComponent }, // Add Simple Task
  { path: 'task-browser', component: TaskBrowserComponent }, // same as TaskNavigatorComponent but sqlite
  { path: 'parent', component: ParentComponent }, // Task Browser
  { path: 'firebase', component: TestFirebaseComponent },
  { path: '', redirectTo: '/protected', pathMatch: 'full' }, // Default route
  // { path: '**', redirectTo: '/parent' }, // Handle invalid routes
  // { path: 'error', component: AddSimpleTaskComponent }, // Handle invalid login routes
  { path: 'register', component: RegisterComponent }, // Register
  { path: 'login', component: LoginComponent }, // Login
  {
    path: 'protected',
    component: TaskNavigatorComponent,
    canActivate: [canActivate],
  }, // Login Test
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
