import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './task-view/task-view.component';
import { HttpClientModule } from '@angular/common/http';
import { InputToTasksComponent } from './input-to-tasks/input-to-tasks.component'; // Add this line
import { FormsModule } from '@angular/forms';
import { AddSimpleTaskComponent } from './add-simple-task/add-simple-task.component';
import { TaskImportanceComponent } from './task-importance/task-importance.component';
import { DatabaseStatusComponent } from './small-components/database-status/database-status.component';
import { OverlordManagerComponent } from './components/overlord-manager/overlord-manager.component';
import { CreateSimpleTaskComponent } from './small-components/create-simple-task/create-simple-task.component';
import { D3VizualizerComponent } from './components/d3-vizualizer/d3-vizualizer.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { FilterManagerComponent } from './components/filter-manager/filter-manager.component';
import { TaskMiniComponent } from './components/task-mini/task-mini.component';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddWithSearchComponent } from './small-components/add-with-search/add-with-search.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    AppComponent,
    TaskViewComponent,
    InputToTasksComponent,
    AddSimpleTaskComponent,
    TaskImportanceComponent,
    DatabaseStatusComponent,
    OverlordManagerComponent,
    CreateSimpleTaskComponent,
    D3VizualizerComponent,
    TaskListComponent,
    FilterManagerComponent,
    TaskMiniComponent,
    AddWithSearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
