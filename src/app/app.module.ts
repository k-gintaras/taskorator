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
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddWithSearchComponent } from './small-components/add-with-search/add-with-search.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CurrentComponent } from './components/current/current.component';
import { OverlordBrowserComponent } from './components/overlord-browser/overlord-browser.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TaskFilterComponent } from './components/task-filter/task-filter.component';
import { TaskoratorComponent } from './components/taskorator/taskorator.component';
import { EditTaskDirective } from './directives/edit-task.directive';
import { MassEditorComponent } from './components/mass-editor/mass-editor.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectOverlordComponent } from './small-components/select-overlord/select-overlord.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    CurrentComponent,
    OverlordBrowserComponent,
    TaskFilterComponent,
    TaskoratorComponent,
    EditTaskDirective,
    MassEditorComponent,
    SelectOverlordComponent,
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
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    NgSelectModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
