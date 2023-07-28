import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './task-view/task-view.component';
import { HttpClientModule } from '@angular/common/http';
import { InputToTasksComponent } from './input-to-tasks/input-to-tasks.component'; // Add this line
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, TaskViewComponent, InputToTasksComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
