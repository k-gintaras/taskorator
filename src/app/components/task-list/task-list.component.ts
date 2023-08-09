import { Component, Input } from '@angular/core';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks: Task[] | undefined;
  @Input() actionName: string | undefined;
  @Input() onButtonClick: Function | undefined;
  @Input() onSelected: Function | undefined;

  selectedTask: Task | null = null;

  constructor(private helper: TaskObjectHelperService) {}

  selectTask(task: Task) {
    this.selectedTask = task;
    console.log('Selected: ' + task.name);
  }

  getOverlord(task: Task) {
    if (task?.overlord && this.tasks) {
      return this.helper.getTaskById(task.overlord, this.tasks);
    } else {
      return undefined;
    }
  }
}
