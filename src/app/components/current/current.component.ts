import { Component } from '@angular/core';
import { LocalService } from 'src/app/services/local.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.css'],
})
export class CurrentComponent {
  selectedTask: Task | undefined;
  tasks: Task[] = [];

  constructor(
    private selected: SelectedTaskService,
    private local: LocalService,
    private taskHelper: TaskObjectHelperService
  ) {}

  ngOnInit() {
    this.selected.getSelectedTaskSubscription().subscribe((task) => {
      if (task) {
        this.selectedTask = task;
      }
    });
    this.local.getAllTasks().subscribe((tasks: Task[]) => {
      if (tasks) {
        this.tasks = tasks;
      }
    });
  }

  getOverlordName() {
    if (this.tasks.length > 0 && this.selectedTask) {
      const id = this.selectedTask.overlord;
      if (id) {
        const overlord = this.taskHelper.getTaskById(id, this.tasks);
        return overlord?.name;
      }
    }
    return '';
  }
}
