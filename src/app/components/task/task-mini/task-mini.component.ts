import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { TaskListDataFacadeService } from '../../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule],
})
export class TaskMiniComponent {
  @Input() task: TaskoratorTask | undefined;

  constructor(private dataFacade: TaskListDataFacadeService) {}

  onTaskCardClick(task: TaskoratorTask | undefined): void {
    if (!task) return;
    this.dataFacade.toggleTaskSelection(task.taskId);
  }
}
