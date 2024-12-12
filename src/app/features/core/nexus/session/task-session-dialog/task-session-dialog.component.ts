// task-sessions/task-session-dialog/task-session-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { TaskSession } from '../task-session.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-task-session-dialog',
  templateUrl: './task-session-dialog.component.html',
  styleUrls: ['./task-session-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButton,
  ],
})
export class TaskSessionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskSession
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
