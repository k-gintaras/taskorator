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
import { TaskBrowserComponent } from './components/task-browser/task-browser.component';
import { ParentComponent } from './components/parent/parent.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuComponent } from './components/menu/menu.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SettingsComponent } from './components/settings/settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddMoveTaskComponent } from './components/add-move-task/add-move-task.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { TestFirebaseComponent } from './components/test-firebase/test-firebase.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { getAuth, provideAuth } from '@angular/fire/auth';

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
    TaskBrowserComponent,
    ParentComponent,
    MenuComponent,
    SettingsComponent,
    AddMoveTaskComponent,
    TestFirebaseComponent,
    LoginComponent,
    ErrorComponent,
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
    MatSnackBarModule,
    MatSidenavModule,
    ReactiveFormsModule,
    MatDialogModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
  bootstrap: [AppComponent],
})
export class AppModule {}
