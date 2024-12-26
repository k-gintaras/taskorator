import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { TaskEditComponent } from '../../task-edit/task-edit.component';
import { Task } from '../../../models/taskModelManager';

@Component({
  selector: 'app-task-edit-popup',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, TaskEditComponent],
  templateUrl: './task-edit-popup.component.html',
  styleUrl: './task-edit-popup.component.scss',
})
export class TaskEditPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskEditPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public task: Task
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(task: Task): void {
    console.log('Saving task:', task);
    this.dialogRef.close(task);
  }
}
