import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TaskEditComponent } from '../../task-edit/task-edit.component';
import { ExtendedTask, TaskoratorTask } from '../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-edit-popup',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    TaskEditComponent,
    MatIcon,
  ],
  templateUrl: './task-edit-popup.component.html',
  styleUrl: './task-edit-popup.component.scss',
})
export class TaskEditPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskEditPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public task: ExtendedTask
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(task: ExtendedTask): void {
    console.log('Saving task:', task);
    this.dialogRef.close(task);
  }
}
