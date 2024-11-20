import { Component, OnInit } from '@angular/core';
import { getBaseTask, Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { CreateTaskComponent } from '../../../../../components/create-task/create-task.component';
import { RandomNavigatorComponent } from '../../../../task-navigator/random-navigator/random-navigator.component';
import { RandomNavigatorService } from '../../../../task-navigator/services/random-navigator.service';

@Component({
  selector: 'app-daily-task-list',
  standalone: true,
  imports: [CreateTaskComponent, RandomNavigatorComponent],
  templateUrl: './daily-task-list.component.html',
  styleUrl: './daily-task-list.component.scss',
})
export class DailyTaskListComponent implements OnInit {
  tasks: Task[] | null = null;
  errorMessage: string | null = null;

  constructor(
    private taskListService: TaskListService,
    private navigatorService: RandomNavigatorService
  ) {}

  async ngOnInit() {
    await this.loadDailyTasks();
  }

  private async loadDailyTasks() {
    try {
      // this.tasks = await this.taskListService.getDailyTasks();
      this.tasks = await this.taskListService.getDailyTasksFiltered();
      const overlord = getBaseTask(); // Set up the root task
      overlord.name = 'Root';
      if (!this.tasks) return;
      this.navigatorService.setInitialTasks(overlord, this.tasks);
      this.navigatorService.setTaskNavigationView(overlord, this.tasks);
      this.errorMessage = null;
    } catch (error) {
      this.tasks = null;
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
