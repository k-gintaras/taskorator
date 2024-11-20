import { Component } from '@angular/core';
import {
  getDefaultTask,
  RepeatOptions,
  Task,
} from '../../../../models/taskModelManager';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgFor, NgForOf } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../../services/task/task.service';

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
  ],
  templateUrl: './create-repetitive-task.component.html',
  styleUrl: './create-repetitive-task.component.scss',
})
export class CreateRepetitiveTaskComponent {
  task: Task = getDefaultTask(); // Start with a default task

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

  constructor(private taskService: TaskService) {}

  saveTask(): void {
    // Here, you'd integrate this with your service or event bus.
    console.log('Task created:', this.task);
    alert(`Repetitive Task "${this.task.name}" created successfully.`);
    this.task.lastUpdated = 0;
    this.taskService.createTask(this.task);
  }

  resetForm(): void {
    this.task = getDefaultTask(); // Reset to default task
  }
}
