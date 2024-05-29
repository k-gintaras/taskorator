import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { getDefaultSettings, TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
import { MenuComponent } from '../menu/menu.component';
import { TaskNavigatorComponent } from '../../features/task-navigator/task-navigator/task-navigator.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-parent',
  standalone: true,
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css'],
  imports: [MenuComponent, TaskNavigatorComponent, NgFor], // Directly import the standalone component
})
export class ParentComponent implements OnInit {
  selectedOverlordId = '0';
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];
  private isInitialized = false;
  settings: TaskSettings = getDefaultSettings();
  private subscription: Subscription | undefined;

  ngOnInit() {
    // Placeholder for loading tasks
    // Placeholder for loading settings
    // Placeholder for subscribing to selected tasks
    console.log('parent initiated');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterTasks(tasks: Task[], settings: TaskSettings) {
    // Placeholder for filtering tasks based on settings
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeTask(t: Task) {
    // Placeholder for removing a task from selected tasks
  }
}
