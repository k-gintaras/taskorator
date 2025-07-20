import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

/**
 * @deprecated replaced by artificer action component that lets you swap to button that promotes or demotes task
 */
@Component({
  selector: 'app-promoter',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './promoter.component.html',
  styleUrl: './promoter.component.scss',
})
export class PromoterComponent {
  @Input() task: TaskoratorTask | undefined;

  constructor(private taskService: TaskUpdateService) {}

  promote() {
    if (this.task) this.taskService.increasePriority(this.task);
  }
  demote() {
    if (this.task) this.taskService.decreasePriority(this.task);
  }
}
