import { Component, Input } from '@angular/core';
import {
  UiTask,
  getDefaultTask,
  getDefaultUiTask,
} from '../../../models/taskModelManager';
import {  NgClass } from '@angular/common';
import { TaskBreadcrumbComponent } from '../task-breadcrumb/task-breadcrumb.component';
import { ColorService } from '../../../services/utils/color.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AiTaskService } from '../../../services/api/ai-task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [ NgClass, TaskBreadcrumbComponent, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input() task: UiTask | null = getDefaultUiTask();
  @Input() ifShowExtra: boolean = false;

  constructor(
    private colorService: ColorService,
    private aiTaskService: AiTaskService
  ) {}

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

  onAiSuggestTasks(): void {
    if (!this.task?.taskId) {
      console.warn('No task ID available');
      return;
    }

    if (!this.aiTaskService.isAiAvailable()) {
      console.warn('AI is not available. Please ensure you are logged in and online.');
      return;
    }

    console.log('Building AI context for task:', this.task.taskId);

    this.aiTaskService.buildTaskContext(this.task.taskId)
      .then((context) => {
        console.log('═════════════════════════════════════════════════');
        console.log(context);
        console.log('═════════════════════════════════════════════════');
      })
      .catch((error) => {
        console.error('Failed to build AI context:', error);
      });
  }

  onXRay(): void {
    // TODO: Open X-Ray view
    // Show all tasks flat from the tree for this task
    console.log('X-Ray clicked for:', this.task?.taskId);
  }
}
