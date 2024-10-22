import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ParentComponent } from './components/parent/parent.component';
import { TreeViewComponent } from './features/tree-view/tree-view.component';
import { TaskNavigatorComponent } from './features/task-navigator/task-navigator/task-navigator.component';
import { SelectedMultipleComponent } from './components/task/selected-multiple/selected-multiple.component';
import { AdminComponent } from './features/admin/admin/admin.component';
import { GptTasksComponent } from './features/gpt/gpt-tasks/gpt-tasks.component';
import { FocusComponent } from './features/focus/focus/focus.component';
import { SessionComponent } from './features/session/session/session.component';
import { TemplateHandlerComponent } from './features/template/template-handler/template-handler.component';
import { FrogTaskComponent } from './features/frog/frog-task/frog-task.component';
import { FavoriteTaskComponent } from './features/favorite/favorite-task/favorite-task.component';
import { SentinelComponent } from './features/core/sentinel/sentinel/sentinel.component';
import { ALL_APP_PATHS } from './app.all-paths.module';
import { CORE_APP_PATHS } from './app.core-paths.module';
import { DreamforgeComponent } from './features/core/dreamforge/dreamforge/dreamforge.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: ALL_APP_PATHS['navigator'].path,
    pathMatch: 'full',
  },

  {
    path: ALL_APP_PATHS['vizualizer'].path,
    component: TreeViewComponent,
  },
  {
    path: ALL_APP_PATHS['parent'].path,
    component: ParentComponent,
  },

  {
    path: ALL_APP_PATHS['login'].path,
    component: LoginComponent,
  },
  {
    path: ALL_APP_PATHS['selected'].path,
    component: SelectedMultipleComponent,
    canActivate: ALL_APP_PATHS['selected'].canActivate,
  },
  {
    path: ALL_APP_PATHS['navigator'].path,
    component: TaskNavigatorComponent,
    canActivate: ALL_APP_PATHS['navigator'].canActivate,
  },
  {
    path: ALL_APP_PATHS['admin'].path,
    component: AdminComponent,
    canActivate: ALL_APP_PATHS['admin'].canActivate,
  },
  {
    path: ALL_APP_PATHS['gptTasks'].path,
    component: GptTasksComponent,
    canActivate: ALL_APP_PATHS['gptTasks'].canActivate,
  },
  {
    path: ALL_APP_PATHS['focus'].path,
    component: FocusComponent,
    canActivate: ALL_APP_PATHS['focus'].canActivate,
  },
  {
    path: CORE_APP_PATHS['sentinel'].path,
    component: SentinelComponent,
  },
  {
    path: ALL_APP_PATHS['session'].path,
    component: SessionComponent,
    canActivate: ALL_APP_PATHS['session'].canActivate,
  },
  {
    path: ALL_APP_PATHS['template'].path,
    component: TemplateHandlerComponent,
    canActivate: ALL_APP_PATHS['template'].canActivate,
  },
  {
    path: ALL_APP_PATHS['frog'].path,
    component: FrogTaskComponent,
    canActivate: ALL_APP_PATHS['frog'].canActivate,
  },
  {
    path: ALL_APP_PATHS['favorite'].path,
    component: FavoriteTaskComponent,
    canActivate: ALL_APP_PATHS['favorite'].canActivate,
  },
  // {
  //   path: CORE_APP_PATHS['forge'].path,
  //   component: DreamforgeComponent,
  //   canActivate: CORE_APP_PATHS['forge'].canActivate,
  // },
  { path: '**', redirectTo: ALL_APP_PATHS['parent'].path },
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
