import { Component, Inject } from '@angular/core';
import { InputToTasksComponent } from '../../features/core/crucible/input-to-tasks/input-to-tasks/input-to-tasks.component';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Task } from '../../models/taskModelManager';

@Component({
  selector: 'app-mass-add-popup',
  standalone: true,
  imports: [InputToTasksComponent, MatIcon, MatDialogActions, MatDialogContent],
  templateUrl: './mass-add-popup.component.html',
  styleUrl: './mass-add-popup.component.scss',
})
export class MassAddPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<MassAddPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public overlord: Task
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    console.log('OnSave popup mass import:');
    this.dialogRef.close();
  }
}
