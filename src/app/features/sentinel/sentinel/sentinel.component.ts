import { Component } from '@angular/core';
import { TaskListService } from '../../../services/task/task-list/task-list.service';
import { getBaseTask, Task } from '../../../models/taskModelManager';
import { NgFor, NgIf } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TaskNavigatorUltraService } from '../../task-navigator/services/task-navigator-ultra.service';
import { SimpleNavigatorComponent } from '../../task-navigator/simple-navigator/simple-navigator.component';

@Component({
  selector: 'app-sentinel',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatList,
    MatListItem,
    MatIcon,
    MatProgressSpinner,
    SimpleNavigatorComponent,
  ],
  templateUrl: './sentinel.component.html',
  styleUrl: './sentinel.component.scss',
})
export class SentinelComponent {
  tasks: Task[] | null = null;
  errorMessage: string | null = null;

  constructor(
    private taskListService: TaskListService,
    private navigatorService: TaskNavigatorUltraService
  ) {}

  async ngOnInit() {
    await this.loadLatestTasks();
  }

  async loadLatestTasks() {
    await this.loadTasks(this.taskListService.getLatestTasks());
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Latest Created Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadOverlordTasks() {
    await this.loadTasks(this.taskListService.getOverlordTasks('128')); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadFocusTasks() {
    await this.loadTasks(this.taskListService.getFocusTasks()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Focus Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadCrushTasks() {
    await this.loadTasks(this.taskListService.getTasksToCrush()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'To Crush Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadSplitTasks() {
    await this.loadTasks(this.taskListService.getTasksToSplit()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'To Split Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadDailyTasks() {
    await this.loadTasks(this.taskListService.getDailyTasks());
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Daily Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadWeeklyTasks() {
    await this.loadTasks(this.taskListService.getWeeklyTasks());
    if (!this.tasks) return;

    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Weekly Tasks';
    overlord.why = '';
    overlord.todo = '';
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
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
