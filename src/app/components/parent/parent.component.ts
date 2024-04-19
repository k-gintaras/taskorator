import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css'],
})
export class ParentComponent implements OnInit {
  selectedOverlordId = '0';
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];
  private isInitialized = false;
  settings: Settings = {
    isShowArchived: false,
    isShowCompleted: false,
    isShowSeen: false,
    isShowDeleted: false,
    isShowTodo: false,
    completeButtonAction: 'todo',
    lastOverlordViewId: '',
  }; // Empty settings object
  private subscription: Subscription | undefined;

  ngOnInit() {
    // Placeholder for loading tasks
    // Placeholder for loading settings
    // Placeholder for subscribing to selected tasks
    console.log('parent initiated');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterTasks(tasks: Task[], settings: Settings) {
    // Placeholder for filtering tasks based on settings
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeTask(t: Task) {
    // Placeholder for removing a task from selected tasks
  }
}
