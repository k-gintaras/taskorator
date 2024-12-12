import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrogTaskService } from '../services/frog-task.service';
import { TaskTreeNode } from '../../../../../models/taskTree';

@Component({
  selector: 'app-frog-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frog-task.component.html',
  styleUrl: './frog-task.component.scss',
})
export class FrogTaskComponent implements OnInit {
  frogTasks: TaskTreeNode[] | undefined;

  constructor(private frogTaskService: FrogTaskService) {}

  ngOnInit(): void {
    this.loadFrogTasks();
  }

  loadFrogTasks(): void {
    this.frogTasks = this.frogTaskService.getFrogTasks();
  }

  addFrogTask(taskId: string): void {
    this.frogTaskService.addFrogTask(taskId);
    this.loadFrogTasks();
  }

  removeFrogTask(taskId: string): void {
    this.frogTaskService.removeFrogTask(taskId);
    this.loadFrogTasks();
  }

  toggleFrogTask(taskId: string): void {
    this.frogTaskService.toggleFrogTask(taskId);
    this.loadFrogTasks();
  }
}
