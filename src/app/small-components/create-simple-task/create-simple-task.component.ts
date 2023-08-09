import { Component, Input } from '@angular/core';
import { SyncService } from 'src/app/services/sync.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-create-simple-task',
  templateUrl: './create-simple-task.component.html',
  styleUrls: ['./create-simple-task.component.scss'],
})
export class CreateSimpleTaskComponent {
  constructor(private sync: SyncService) {}
  @Input() overlordId: number | undefined;
  newTask: Task = getDefaultTask();
  createTask() {
    const newTask: Task = { ...this.newTask }; // Create a new task object
    if (this.overlordId) {
      newTask.overlord = this.overlordId;
    } else {
      newTask.overlord = 128;
    }
    this.sync.createTask(newTask).subscribe();
  }
}
