/* eslint-disable @typescript-eslint/ban-types */
import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { SelectedMultipleService } from '../../../services/tasks/selected/selected-multiple.service';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule],
})
export class TaskMiniComponent {
  @Input() task: TaskoratorTask | undefined;

  constructor(
    private selectedMultiple: SelectedMultipleService,
  ) {}

  onTaskCardClick(task: TaskoratorTask | undefined) {
    if (!task) return;
    this.selectedMultiple.addRemoveSelectedTask(task);
  }
}
