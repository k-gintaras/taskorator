import { Component, Input } from '@angular/core';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task, getDefaultTask } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks: Task[] | undefined;
  @Input() actionName: string | undefined;
  @Input() onButtonClick: Function | undefined;
  @Input() onTaskSelected: Function | undefined;

  selectedTask: Task | null = null;

  constructor(
    private helper: TaskObjectHelperService,
    private selected: SelectedTaskService
  ) {}

  selectTask(task: Task) {
    this.selectedTask = task;
    this.selected.setSelectedTask(task);
    console.log('Selected: ' + task.name);
    if (this.onTaskSelected) {
      console.log('hm');
      this.onTaskSelected(task);
    }
  }

  getOverlord(task: Task) {
    if (task?.overlord && this.tasks) {
      return this.helper.getTaskById(task.overlord, this.tasks);
    } else {
      return undefined;
    }
  }
}
