import { Component } from '@angular/core';
import {
  getDefaultTask,
  RepeatOptions,
  TaskoratorTask,
} from '../../../../models/taskModelManager';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TaskUpdateService } from '../../../../services/tasks/task-update.service';
import { MatIcon } from '@angular/material/icon';
import { ErrorService } from '../../../../services/core/error.service';

@Component({
  selector: 'app-create-repetitive-task',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgForOf,
    MatIcon,
  ],
  templateUrl: './create-repetitive-task.component.html',
  styleUrl: './create-repetitive-task.component.scss',
})
export class CreateRepetitiveTaskComponent {
  task: TaskoratorTask = getDefaultTask(); // Start with a default task

  repeatOptions: RepeatOptions[] = [
    'never',
    'once',
    'half-hourly',
    'hourly',
    'half-daily',
    'daily',
    'weekly',
    'monthly',
    'yearly',
  ];

  constructor(
    private taskService: TaskUpdateService,
    private errorService: ErrorService
  ) {}

  saveTask(): void {
    if (this.task.name.trim() === '') {
      this.errorService.warn('Task name cannot be empty');
      return;
    }
    this.task.lastUpdated = 0;
    this.taskService.create(this.task);
  }

  resetForm(): void {
    this.task = getDefaultTask(); // Reset to default task
  }
}
