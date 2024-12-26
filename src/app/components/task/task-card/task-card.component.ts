import { Component, Input } from '@angular/core';
import { getDefaultTask } from '../../../models/taskModelManager';
import { Task } from '../../../models/taskModelManager';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input() task: Task = getDefaultTask();

  thereIsTags() {
    const task = this.task;
    return task?.tags && task.tags.length > 0 && Array.isArray(task.tags);
  }
}
