import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { CreateTaskComponent } from '../../../../../components/task/create-task/create-task.component';
import {
  TaskListKey,
  TaskListService,
} from '../../../../../services/tasks/task-list.service';
import { TaskTransmutationService } from '../../../../../services/tasks/task-transmutation.service';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';

@Component({
  selector: 'app-latest-created-task-list',
  standalone: true,
  imports: [CreateTaskComponent, TaskNavigatorComponent],
  templateUrl: './latest-created-task-list.component.html',
  styleUrl: './latest-created-task-list.component.scss',
})
export class LatestCreatedTaskListComponent implements OnInit {
  tasks: Task[] | null = null;
  errorMessage: string = '';

  constructor(
    private taskListService: TaskListService,
    private navigatorService: TaskNavigatorUltraService,
    private transmutatorServive: TaskTransmutationService
  ) {}

  async ngOnInit() {
    await this.loadTasks();
  }

  private async loadTasks() {
    try {
      this.tasks = await this.taskListService.getLatestTasks();
      if (!this.tasks) return;
      const extended = this.transmutatorServive.toExtendedTasks(this.tasks);
      this.navigatorService.loadAndInitializeTasks(
        extended,
        TaskListKey.CREATED
      );
      this.errorMessage = '';
    } catch (error) {
      this.tasks = null;
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
