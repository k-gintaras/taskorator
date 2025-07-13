import { Component, Input } from '@angular/core';
import { UiTask, getDefaultTask } from '../../../models/taskModelManager';
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
  @Input() task: UiTask | null = {
    ...getDefaultTask(),
    isSelected: false,
    isRecentlyViewed: false,
    completionPercent: 0,
    color: '',
    views: 0,
    isRecentlyUpdated: false,
    isRecentlyCreated: false,
    children: 0,
    completedChildren: 0,
    secondaryColor: '',
    magnitude: 0,
    isConnectedToTree: true,
  };

  @Input() ifShowExtra: boolean = false;

  thereIsTags() {
    const task = this.task;
    return task?.tags && task.tags.length > 0 && Array.isArray(task.tags);
  }
}
