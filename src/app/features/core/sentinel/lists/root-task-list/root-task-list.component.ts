import { Component, OnInit } from '@angular/core';
import { Task, ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { CreateTaskComponent } from '../../../../../components/task/create-task/create-task.component';
import {
  TaskListKey,
  TaskListService,
} from '../../../../../services/tasks/task-list.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskTransmutationService } from '../../../../../services/tasks/task-transmutation.service';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';

@Component({
  selector: 'app-root-task-list',
  standalone: true,
  imports: [CreateTaskComponent, TaskNavigatorComponent],
  templateUrl: './root-task-list.component.html',
  styleUrl: './root-task-list.component.scss',
})
export class RootTaskListComponent implements OnInit {
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
      this.tasks = await this.taskListService.getOverlordTasks(ROOT_TASK_ID);
      if (!this.tasks) return;
      const extended = this.transmutatorServive.toExtendedTasks(this.tasks);
      this.navigatorService.loadAndInitializeTasks(
        extended,
        TaskListKey.OVERLORD + ROOT_TASK_ID
      );
      this.errorMessage = '';
    } catch (error) {
      this.tasks = null;
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
