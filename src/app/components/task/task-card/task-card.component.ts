import { Component, Input } from '@angular/core';
import {
  UiTask,
  getDefaultTask,
  getDefaultUiTask,
} from '../../../models/taskModelManager';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TaskBreadcrumbComponent } from '../task-breadcrumb/task-breadcrumb.component';
import { ColorService } from '../../../services/utils/color.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, NgClass, TaskBreadcrumbComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input() task: UiTask | null = getDefaultUiTask();
  @Input() ifShowExtra: boolean = false;

  constructor(private colorService: ColorService) {}

  thereIsTags() {
    const task = this.task;
    return task?.tags && task.tags.length > 0 && Array.isArray(task.tags);
  }

  getAgeBasedBorderColor(): string {
    if (!this.task?.timeCreated) {
      return this.task?.color || '#8b5cf6'; // fallback to purple
    }
    return this.colorService.getDateBasedColor(this.task.timeCreated);
  }
}
