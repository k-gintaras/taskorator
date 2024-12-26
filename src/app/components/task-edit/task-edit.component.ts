import { Component, Input } from '@angular/core';
import { getRandomTask } from '../../test-files/test-data/test-task';
import { getBaseTask, Task } from '../../models/taskModelManager';
import { FormsModule } from '@angular/forms';
import { TaskUpdateService } from '../../services/task/task-update.service';
import {
  TaskAction,
  TaskActions,
} from '../../services/tasks/task-action-tracker.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.scss',
})
export class TaskEditComponent {
  // @Input() task: Task = getRandomTask();
  @Input() task: Task = getBaseTask();

  // Display values for duration and end time
  endTimeDisplay: string | null = null;
  durationDisplay: number | null = null;
  constructor(private taskUpdateService: TaskUpdateService) {}

  ngOnInit() {
    // Convert initial task values from milliseconds
    this.endTimeDisplay = this.task.timeEnd
      ? new Date(this.task.timeEnd).toISOString().slice(0, 16) // Format for datetime-local
      : null;

    this.durationDisplay = this.task.duration
      ? this.task.duration / 60000
      : null; // Convert to minutes
  }

  onSave(t: Task) {
    if (t) {
      const taskAction: TaskActions = TaskActions.UPDATED;
      this.taskUpdateService.update(t, taskAction);
    }
  }

  updateTimeEnd(newTime: string) {
    // Convert from datetime-local string to milliseconds
    this.task.timeEnd = new Date(newTime).getTime();
  }

  updateDuration(newDuration: number) {
    // Convert from minutes to milliseconds
    this.task.duration = newDuration * 60000;
  }
}
