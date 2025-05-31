import { Component, Input } from '@angular/core';
import { Task } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promoter',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './promoter.component.html',
  styleUrl: './promoter.component.scss',
})
export class PromoterComponent {
  @Input() task: Task | undefined;

  constructor(private taskService: TaskUpdateService) {}

  promote() {
    if (this.task) this.taskService.increasePriority(this.task);
  }
  demote() {
    if (this.task) this.taskService.decreasePriority(this.task);
  }
}
