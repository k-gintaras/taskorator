import { Component, Input } from '@angular/core';
import { TaskService } from '../../../services/task/task.service';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/task/task-update.service';

@Component({
  selector: 'app-promoter',
  standalone: true,
  imports: [],
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
