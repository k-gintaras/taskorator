/* eslint-disable @typescript-eslint/ban-types */
import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { completeButtonColorMap } from '../../../models/colors';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SelectedMultipleService } from '../../../services/tasks/selected/selected-multiple.service';
import { SelectedTaskService } from '../../../services/tasks/selected/selected-task.service';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule, MatIcon],
})
export class TaskMiniComponent {
  @Input() task: TaskoratorTask | undefined;
  @Input() overlord: TaskoratorTask | null | undefined;
  expanded = false;

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private selected: SelectedTaskService
  ) {}

  viewDetails(task: TaskoratorTask | undefined) {
    console.log(task);
  }

  editTask(task: TaskoratorTask | undefined) {
    console.log(task);
  }

  getStatusColor() {
    return this.task?.stage ? completeButtonColorMap[this.task.stage] : 'black';
  }

  onTaskCardClick(task: TaskoratorTask | undefined) {
    if (!task) return;
    this.selectedMultiple.addRemoveSelectedTask(task);
    this.selected.setSelectedTask(task);
  }

  isSelected(task: TaskoratorTask | undefined): boolean {
    if (!task) return false;
    return this.selectedMultiple.isSelected(task);
  }
}
