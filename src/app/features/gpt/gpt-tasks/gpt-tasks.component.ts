import { Component } from '@angular/core';
import { GptTasksService } from '../services/gpt-tasks.service';
import { Task } from '../../../models/taskModelManager';
import { TaskService } from '../../../services/task/task.service';
import { CommonModule, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-gpt-tasks',
  standalone: true,
  imports: [NgFor, CommonModule, MatButtonModule, MatListModule, MatIcon],
  templateUrl: './gpt-tasks.component.html',
  styleUrl: './gpt-tasks.component.scss',
})
export class GptTasksComponent {
  tasks$ = this.gptTaskService.getTasks();

  constructor(
    private gptTaskService: GptTasksService,
    private taskService: TaskService
  ) {}

  // addTask(task: Task) {
  //   this.gptTaskService.addTask(task);
  // }

  removeTask(task: Task) {
    this.gptTaskService.removeTask(task.taskId);
  }

  approveTask(task: Task) {
    if (task.name.trim().length > 0) {
      this.taskService.createTask(task);
      this.removeTask(task);
    }
  }
}
