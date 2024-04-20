// core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

// other
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';

// firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

// mat
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';

// components
import { AppComponent } from './app.component';
import { ParentComponent } from '../components/parent/parent.component';
import { TaskMiniComponent } from '../components/task-mini/task-mini.component';
import { MenuComponent } from '../components/menu/menu.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { AddMoveTaskComponent } from '../components/add-move-task/add-move-task.component';
import { LoginComponent } from '../components/login/login.component';
import { ErrorComponent } from '../components/error/error.component';
import { TaskNavigatorComponent } from '../features/task-navigator/task-navigator/task-navigator.component';
import { TreeViewComponent } from '../features/tree-view/tree-view.component';
import { BaseComponent } from '../components/base/base.component';
import { environment } from '../../environments/environment';

// export function initializeServices(serviceInitiator: ServiceInitiatorService) {
//   return (): Promise<void> => serviceInitiator.initApiServices();
// }
@NgModule({
  declarations: [
    AppComponent,
    TaskMiniComponent,
    ParentComponent,
    MenuComponent,
    SettingsComponent,
    AddMoveTaskComponent,
    LoginComponent,
    ErrorComponent,
    TaskNavigatorComponent,
    TreeViewComponent,
    BaseComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeServices,
    //   deps: [ServiceInitiatorService],
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
