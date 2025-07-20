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
}
