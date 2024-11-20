import { Component, OnInit } from '@angular/core';
import { getBaseTask, Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { CreateTaskComponent } from '../../../../../components/create-task/create-task.component';
import { RandomNavigatorService } from '../../../../task-navigator/services/random-navigator.service';
import { RandomNavigatorComponent } from '../../../../task-navigator/random-navigator/random-navigator.component';
import { WeeklyListService } from '../../services/weekly-list.service';

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
    private taskListService: WeeklyListService,
    private navigatorService: RandomNavigatorService
  ) {}

  async ngOnInit() {
    await this.loadWeeklyTasks();
  }

  private async loadWeeklyTasks() {
    this.taskListService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;

        // Set up the root task for navigation
        const overlord = { ...getBaseTask(), name: 'Root' }; // Root task for the navigator
        if (this.tasks && this.tasks.length > 0) {
          this.navigatorService.setInitialTasks(overlord, this.tasks);
          this.navigatorService.setTaskNavigationView(overlord, this.tasks);
        }
        this.errorMessage = '';
      },
      error: (error) => {
        this.tasks = null;
        this.errorMessage = 'Failed to load daily tasks.';
        console.error(error);
      },
    });
  }
}
