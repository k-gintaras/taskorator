import { Component, OnInit } from '@angular/core';
import { getBaseTask, Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { CreateTaskComponent } from '../../../../../components/create-task/create-task.component';
import { RandomNavigatorComponent } from '../../../../task-navigator/random-navigator/random-navigator.component';
import { RandomNavigatorService } from '../../../../task-navigator/services/random-navigator.service';
import { TaskListAssistantService } from '../../../../../services/task/task-list/task-list-assistant.service';
import { DailyListService } from '../../services/daily-list.service';

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
    private navigatorService: RandomNavigatorService,
    private taskListAssistant: TaskListAssistantService,
    private dailyTasksService: DailyListService
  ) {}

  async ngOnInit() {
    await this.loadDailyTasks();
  }

  private async loadDailyTasks() {
    this.dailyTasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;

        // Set up the root task for navigation
        const overlord = { ...getBaseTask(), name: 'Root' }; // Root task for the navigator
        if (this.tasks && this.tasks.length > 0) {
          this.tasks = [];
        }
        this.navigatorService.setInitialTasks(overlord, this.tasks);
        this.navigatorService.setTaskNavigationView(overlord, this.tasks);
        this.errorMessage = null;
      },
      error: (error) => {
        this.tasks = null;
        this.errorMessage = 'Failed to load daily tasks.';
        console.error(error);
      },
    });
    // try {
    //   // this.tasks = await this.taskListService.getDailyTasks();
    //   this.tasks = await this.taskListService.getDailyTasksFiltered();

    //   // if (tasks) {
    //   //   tasks = this.taskListAssistant.filterTasks(tasks, true, 'daily');
    //   // }

    //   const overlord = getBaseTask(); // Set up the root task
    //   overlord.name = 'Root';
    //   if (!this.tasks) return;
    //   this.navigatorService.setInitialTasks(overlord, this.tasks);
    //   this.navigatorService.setTaskNavigationView(overlord, this.tasks);
    //   this.errorMessage = null;
    // } catch (error) {
    //   this.tasks = null;
    //   this.errorMessage = 'Failed to load daily tasks.';
    //   console.error(error);
    // }
  }
}
