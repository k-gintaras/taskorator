import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SyncService } from 'src/app/services/sync.service';
import { TaskService } from 'src/app/services/task.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-create-simple-task',
  templateUrl: './create-simple-task.component.html',
  styleUrls: ['./create-simple-task.component.scss'],
})
export class CreateSimpleTaskComponent {
  constructor(
    private taskService: TaskService,
    @Optional() public dialogRef?: MatDialogRef<CreateSimpleTaskComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { overlord: Task }
  ) {}

  @Input() overlord: Task | undefined = this.data?.overlord;
  newTask: Task = getDefaultTask();

  // createTask() {
  //   const newTask: Task = { ...this.newTask }; // Clone
  //   if (this.overlord) {
  //     newTask.overlord = this.overlord.taskId;
  //   } else {
  //     newTask.overlord = 128; // Your default Overlord ID
  //   }
  //   this.taskService.create(newTask);
  // }
  createTask() {
    const newTask: Task = { ...this.newTask }; // Clone
    let overlordToUse = this.overlord || this.data?.overlord;

    if (overlordToUse) {
      newTask.overlord = overlordToUse.taskId;
    } else {
      newTask.overlord = 128; // Your default Overlord ID
    }
    this.taskService.create(newTask);
  }
}

// export class CreateSimpleTaskComponent {
//   constructor(
//     private taskService: TaskService,
//     public dialogRef: MatDialogRef<CreateSimpleTaskComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { overlord: Task }
//   ) {}
//   @Input() overlord: Task | undefined;
//   newTask: Task = getDefaultTask();
//   createTask() {
//     const newTask: Task = { ...this.newTask }; // Create a new task object
//     if (this.overlord) {
//       newTask.overlord = this.overlord.taskId;
//     } else {
//       newTask.overlord = 128;
//     }
//     this.taskService.create(newTask);
//   }
// }
