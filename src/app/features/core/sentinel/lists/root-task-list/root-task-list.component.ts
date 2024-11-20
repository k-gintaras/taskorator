import { Component, OnInit } from '@angular/core';
import {
  Task,
  ROOT_TASK_ID,
  getBaseTask,
} from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { CreateTaskComponent } from '../../../../../components/create-task/create-task.component';
import { SimpleNavigatorComponent } from '../../../../task-navigator/simple-navigator/simple-navigator.component';
import { TaskNavigatorUltraService } from '../../../../task-navigator/services/task-navigator-ultra.service';

@Component({
  selector: 'app-root-task-list',
  standalone: true,
  imports: [CreateTaskComponent, SimpleNavigatorComponent],
  templateUrl: './root-task-list.component.html',
  styleUrl: './root-task-list.component.scss',
})
export class RootTaskListComponent implements OnInit {
  tasks: Task[] | null = null;
  errorMessage: string = '';

  constructor(
    private taskListService: TaskListService,
    private navigatorService: TaskNavigatorUltraService
  ) {}

  async ngOnInit() {
    await this.loadDailyTasks();
  }

  private async loadDailyTasks() {
    try {
      this.tasks = await this.taskListService.getOverlordTasks(ROOT_TASK_ID);
      const overlord = getBaseTask(); // Set up the root task
      overlord.name = 'Root';
      if (!this.tasks) return;
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
