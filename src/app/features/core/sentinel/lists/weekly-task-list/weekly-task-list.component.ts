import { Component, OnInit } from '@angular/core';
import { getBaseTask, Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { CreateTaskComponent } from '../../../../../components/create-task/create-task.component';
import { RandomNavigatorService } from '../../../../task-navigator/services/random-navigator.service';
import { RandomNavigatorComponent } from '../../../../task-navigator/random-navigator/random-navigator.component';

@Component({
  selector: 'app-weekly-task-list',
  standalone: true,
  imports: [CreateTaskComponent, RandomNavigatorComponent],
  templateUrl: './weekly-task-list.component.html',
  styleUrl: './weekly-task-list.component.scss',
})
export class WeeklyTaskListComponent implements OnInit {
  tasks: Task[] | null = null;
  errorMessage: string = '';

  constructor(
    private taskListService: TaskListService,
    private navigatorService: RandomNavigatorService
  ) {}

  async ngOnInit() {
    await this.loadDailyTasks();
  }

  private async loadDailyTasks() {
    try {
      this.tasks = await this.taskListService.getWeeklyTasks();
      const overlord = getBaseTask(); // Set up the root task
      overlord.name = 'Root';
      if (!this.tasks) this.tasks = [];
      this.navigatorService.setInitialTasks(overlord, this.tasks);
      this.navigatorService.setTaskNavigationView(overlord, this.tasks);
      this.errorMessage = '';
    } catch (error) {
      this.tasks = null;
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
