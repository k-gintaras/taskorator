import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StagedTasksService } from '../../../services/tasks/staged-task.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { getRandomTasks } from '../../../test-files/test-data/test-task';
import { of } from 'rxjs/internal/observable/of';
import { Task } from '../../../models/taskModelManager';
import { TaskMiniComponent } from '../task-mini/task-mini.component';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TaskEditPopupComponent } from '../task-edit-popup/task-edit-popup.component';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, TaskMiniComponent, MatIcon],
  selector: 'app-staged-task-list',
  templateUrl: './staged-task-list.component.html',
  styleUrls: ['./staged-task-list.component.scss'],
})
export class StagedTaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() tasksChange = new EventEmitter<Task[]>(); // Notify parent about changes

  constructor(private dialog: MatDialog) {}

  deleteTask(t: Task): void {
    this.tasks = this.tasks.filter((task) => task.taskId !== t.taskId);
    this.tasksChange.emit(this.tasks); // Emit the updated tasks list
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: task, // Pass the task to edit
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Task updated in memory:', result);
        // Update the task in your list or database
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }
}
