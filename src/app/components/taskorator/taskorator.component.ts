import { Component, Input } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-taskorator',
  templateUrl: './taskorator.component.html',
  styleUrls: ['./taskorator.component.css'],
})
export class TaskoratorComponent {
  @Input() task: Task | undefined;
  @Input() isVisible: boolean = false;

  constructor(private taskService: TaskService) {}

  dateToString(date: Date | null): string | null {
    return date ? date.toISOString().substring(0, 16) : null;
  }

  stringToDate(dateString: string | null): Date | null {
    return dateString ? new Date(dateString) : null;
  }

  taskChanged() {}

  save() {
    if (!this.task) return;
    this.taskService.update(this.task);
  }
}
