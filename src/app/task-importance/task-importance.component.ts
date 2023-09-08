import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Task } from '../task-model/taskModelManager';
import { LocalService } from '../services/local.service';
import { SelectedTaskService } from '../services/selected-task.service';

/**
 * @deprecated a little test for deprecated
 */
@Component({
  selector: 'app-task-importance',
  templateUrl: './task-importance.component.html',
  styleUrls: ['./task-importance.component.scss'],
})
export class TaskImportanceComponent {
  selectedTask: Task | null = null;
  private selectedTaskSubscription: Subscription;

  constructor(private selected: SelectedTaskService) {
    // Subscribe to the selectedTaskObservable to get the selected task
    this.selectedTaskSubscription =
      this.selected.selectedTaskObservable.subscribe((task) => {
        if (task) {
          console.log('Selected: ' + task.name);
          this.selectedTask = task;
        }
      });
  }

  private updateSelectedTaskImportance() {
    if (this.selectedTask) {
      console.log(this.selectedTask);
    }
  }

  ngOnDestroy() {
    // Unsubscribe from the selectedTaskObservable to avoid memory leaks
    this.selectedTaskSubscription.unsubscribe();
  }

  // Function to upgrade the task importance
  upgradeImportance() {
    if (this.selectedTask) {
      if (this.selectedTask.priority < 10) {
        this.selectedTask.priority++;
        this.updateSelectedTaskImportance();
      }
    }
  }

  // Function to downgrade the task importance
  downgradeImportance() {
    if (this.selectedTask) {
      if (this.selectedTask.priority > 1) {
        this.selectedTask.priority--;
        this.updateSelectedTaskImportance();
      }
    }
  }
}
