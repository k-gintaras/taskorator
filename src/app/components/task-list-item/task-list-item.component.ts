import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChunkedProgressComponent } from '../chunked-progress/chunked-progress.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';
import { UiTask } from '../../models/taskModelManager';
import { TaskNodeInfo } from '../../models/taskTree';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';

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
  @Input() isSelected = false; // ← Selection passed from parent

  @Output() navigate = new EventEmitter<UiTask>();
  @Output() taskClick = new EventEmitter<UiTask>();

  constructor(private taskTransmutationService: TaskTransmutationService) {}

  getContainerClasses(): string {
    const classes = ['task-container'];

    // Use pre-computed UiTask properties
    if (this.task.isSelected || this.isSelected) classes.push('selected');
    if (this.task.isRecentlyViewed) classes.push('viewed');
    if (this.task.isRecentlyUpdated) classes.push('updated');
    if (this.task.isRecentlyCreated) classes.push('new');

    // Add magnitude-based sizing
    if (this.task.magnitude > 7) classes.push('high-magnitude');
    else if (this.task.magnitude > 4) classes.push('medium-magnitude');
    else classes.push('low-magnitude');

    return classes.join(' ');
  }

  onNavigateClick(event: Event) {
    event.stopPropagation();
    this.navigate.emit(this.task);
  }

  onTaskClick() {
    this.taskClick.emit(this.task);
  }

  getTreeNodeInfo(): TaskNodeInfo | null {
    if (!this.task) {
      return null;
    }
    return this.taskTransmutationService.toTaskNodeInfo(this.task);
  }
}
