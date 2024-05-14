import { Component } from '@angular/core';
import { TaskListService } from '../../../services/task/task-list/task-list.service';
import { Task } from '../../../models/taskModelManager';
import { NgFor, NgIf } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sentinel',
  standalone: true,
  imports: [NgIf, NgFor, MatList, MatListItem, MatIcon, MatProgressSpinner],
  templateUrl: './sentinel.component.html',
  styleUrl: './sentinel.component.scss',
})
export class SentinelComponent {
  tasks: Task[] | null = null;
  errorMessage: string | null = null;

  constructor(private taskListService: TaskListService) {}

  async ngOnInit() {
    await this.loadLatestTasks();
  }

  async loadLatestTasks() {
    await this.loadTasks(this.taskListService.getLatestTasks());
  }

  async loadOverlordTasks() {
    await this.loadTasks(this.taskListService.getOverlordTasks('128')); // replace 'someTaskId' with the actual ID
  }

  async loadFocusTasks() {
    await this.loadTasks(this.taskListService.getFocusTasks()); // replace 'someTaskId' with the actual ID
  }

  async loadCrushTasks() {
    await this.loadTasks(this.taskListService.getTasksToCrush()); // replace 'someTaskId' with the actual ID
  }

  async loadSplitTasks() {
    await this.loadTasks(this.taskListService.getTasksToSplit()); // replace 'someTaskId' with the actual ID
  }

  async loadDailyTasks() {
    await this.loadTasks(this.taskListService.getDailyTasks());
  }

  async loadWeeklyTasks() {
    await this.loadTasks(this.taskListService.getWeeklyTasks());
  }

  private async loadTasks(taskLoader: Promise<Task[] | null>) {
    try {
      this.tasks = await taskLoader;
      this.errorMessage = null;
    } catch (error) {
      this.tasks = null; // Set tasks to an empty array to stop the loader
      this.errorMessage = 'Failed to load tasks.';
      console.error(error);
    }
  }
}
