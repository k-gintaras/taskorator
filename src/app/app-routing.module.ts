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

const routes: Routes = [
  { path: 'task-filter', component: TaskFilterComponent },
  { path: 'overlord-browser', component: OverlordBrowserComponent },
  { path: 'task-view', component: TaskViewComponent },
  { path: 'filter-manager', component: FilterManagerComponent },
  { path: 'd3-vizualizer', component: D3VizualizerComponent },
  { path: 'overlord-manager', component: OverlordManagerComponent },
  { path: 'task-importance', component: TaskImportanceComponent },
  { path: 'input-to-tasks', component: InputToTasksComponent },
  { path: 'add-simple-task', component: AddSimpleTaskComponent },
  { path: 'task-browser', component: TaskBrowserComponent },
  { path: 'parent', component: ParentComponent },
  { path: '', redirectTo: '/task-view', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/task-view' }, // Handle invalid routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
