/* eslint-disable @typescript-eslint/ban-types */
import { Component, Input } from '@angular/core';
import { Task } from '../../../models/taskModelManager';
import { completeButtonColorMap } from '../../../models/colors';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SelectedMultipleService } from '../../../services/tasks/selected-multiple.service';
import { SelectedTaskService } from '../../../services/tasks/selected-task.service';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule, MatIcon],
})
export class TaskMiniComponent {
  @Input() task: Task | undefined;
  @Input() overlord: Task | null | undefined;
  expanded = false;

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private selected: SelectedTaskService
  ) {}

  viewDetails(task: Task | undefined) {
    console.log(task);
  }

  editTask(task: Task | undefined) {
    console.log(task);
  }

  getStatusColor() {
    return this.task?.stage ? completeButtonColorMap[this.task.stage] : 'black';
  }

  onTaskCardClick(task: Task | undefined) {
    if (!task) return;
    this.selectedMultiple.addRemoveSelectedTask(task);
    this.selected.setSelectedTask(task);
  }

  isSelected(task: Task | undefined): boolean {
    if (!task) return false;
    return this.selectedMultiple.isSelected(task);
  }
}
