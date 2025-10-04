import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { UiTask } from '../../models/taskModelManager';
import { TaskNodeInfo } from '../../models/taskTree';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';
import { ChunkedProgressComponent } from '../chunked-progress/chunked-progress.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';

@Component({
  selector: 'app-task-list-item',
  standalone: true,
  imports: [
    CommonModule,
    TaskMiniComponent,
    ArtificerActionComponent,
    ChunkedProgressComponent,
    MatIcon,
  ],
  templateUrl: './task-list-item.component.html',
})
export class TaskListItemComponent {
  @Input() task!: UiTask;
  @Output() navigate = new EventEmitter<UiTask>();

  constructor(private taskTransmutationService: TaskTransmutationService) {}

  onNavigateClick(event: Event): void {
    event.stopPropagation();
    this.navigate.emit(this.task);
  }

  getTreeNodeInfo(): TaskNodeInfo | null {
    return this.task
      ? this.taskTransmutationService.toTaskNodeInfo(this.task)
      : null;
  }

  getButtonClasses(): string {
    const baseClasses = 'border hover:scale-105';
    
    if (this.task.isRecentlyViewed) {
      return `${baseClasses} border-purple-300 bg-purple-500 text-white dark:border-purple-400 dark:bg-purple-600`;
    }
    
    if (this.task.isRecentlyUpdated) {
      return `${baseClasses} border-green-300 bg-green-500 text-white dark:border-green-400 dark:bg-green-600`;
    }
    
    if (this.task.isRecentlyCreated) {
      return `${baseClasses} border-blue-300 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600`;
    }
    
    return `${baseClasses} border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`;
  }
}
