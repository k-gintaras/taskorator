  /* eslint-disable @typescript-eslint/ban-types */
import { Component, Input } from '@angular/core';
import { Task } from '../../models/taskModelManager';
import { completeButtonColorMap } from '../../models/colors';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule, MatIcon],
})
export class TaskMiniComponent {
  @Input() task: Task | undefined;
  @Input() overlord: Task | null | undefined;
  @Input() actionName: string | undefined;
  @Input() onButtonClick: Function | undefined;
  @Input() onTaskSelected: Function | undefined;
  expanded = false;

  doTask(event: Event, task: Task | undefined) {
    // event.stopPropagation();

    if (this.onButtonClick) {
      console.log('Doing: ' + this.actionName + ' to: ' + task?.name);
      this.onButtonClick(task);
    }

    // if(this.action===Acti)
  }
  onTaskSelection() {
    if (this.onTaskSelected) {
      console.log('hm');
      this.onTaskSelected(this.task);
    }
  }

  viewDetails(task: Task | undefined) {
    console.log(task);
  }

  editTask(task: Task | undefined) {
    console.log(task);
  }

  getStatusColor() {
    return this.task?.stage ? completeButtonColorMap[this.task.stage] : 'black';
  }
}
