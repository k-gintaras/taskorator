import { Component, Input } from '@angular/core';
import { getDefaultTask } from '../../../models/taskModelManager';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TaskBreadcrumbComponent } from '../task-breadcrumb/task-breadcrumb.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, NgClass, TaskBreadcrumbComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input() task: TaskoratorTask = getDefaultTask();

  thereIsTags() {
    const task = this.task;
    return task?.tags && task.tags.length > 0 && Array.isArray(task.tags);
  }
}
