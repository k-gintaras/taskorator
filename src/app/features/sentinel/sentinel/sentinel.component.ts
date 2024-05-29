import { Component } from '@angular/core';
import { TaskListService } from '../../../services/task/task-list/task-list.service';
import { getBaseTask, Task } from '../../../models/taskModelManager';
import { NgFor, NgIf } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TaskNavigatorUltraService } from '../../task-navigator/services/task-navigator-ultra.service';
import { SimpleNavigatorComponent } from '../../task-navigator/simple-navigator/simple-navigator.component';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CreateTaskComponent } from '../../../components/create-task/create-task.component';

@Component({
  selector: 'app-sentinel',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatList,
    MatListItem,
    MatIcon,
    MatButton,
    MatProgressSpinner,
    SimpleNavigatorComponent,
    CreateTaskComponent,
    MatChipsModule,
  ],
  templateUrl: './sentinel.component.html',
  styleUrl: './sentinel.component.scss',
})
export class SentinelComponent {
  tasks: Task[] | null = null;
  errorMessage: string | null = null;
  title = '';
  description =
    'Decision maker, decision helper, pick what kind of tasks you want to see and do.';

  constructor(
    private taskListService: TaskListService,
    private navigatorService: TaskNavigatorUltraService
  ) {}

  async ngOnInit() {
    await this.loadLatestTasks();
    this.loadTitle();
  }

  async loadLatestTasks() {
    await this.loadTasks(this.taskListService.getLatestTasks());
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('Latest Created Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadOverlordTasks() {
    await this.loadTasks(this.taskListService.getOverlordTasks('128')); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('Root Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadFocusTasks() {
    await this.loadTasks(this.taskListService.getFocusTasks()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('Focus Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadCrushTasks() {
    await this.loadTasks(this.taskListService.getTasksToCrush()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('To Crush Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadSplitTasks() {
    await this.loadTasks(this.taskListService.getTasksToSplit()); // replace 'someTaskId' with the actual ID
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('To Split Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadDailyTasks() {
    await this.loadTasks(this.taskListService.getDailyTasks());
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('All Daily Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadDailyFilteredTasks() {
    await this.loadTasks(this.taskListService.getDailyTasksFiltered());
    if (!this.tasks) return;
    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('Daily Tasks');

    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }

  async loadWeeklyTasks() {
    await this.loadTasks(this.taskListService.getWeeklyTasks());
    if (!this.tasks) return;

    const overlord = getBaseTask(); // just let it be base task, which is root task
    overlord.name = 'Root';
    this.setSelectedTitle('Weekly Tasks');
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

  setSelectedTitle(s: string) {
    this.taskListService.setSelectedTitle(s);
  }

  loadTitle() {
    this.taskListService
      .getSelectedTitleObservable()
      .subscribe((t: string | null) => {
        if (t) this.title = t;
      });
  }
}
