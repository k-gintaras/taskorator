import { Component, OnInit } from '@angular/core';
import { Task, ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { CreateTaskComponent } from '../../../../../components/task/create-task/create-task.component';
import { TaskListService } from '../../../../../services/tasks/task-list.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskTransmutationService } from '../../../../../services/tasks/task-transmutation.service';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import {
  TaskListType,
  TaskListKey,
  TaskListRules,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

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
  taskListRules: TaskListRules | null = null;

  constructor(
    private taskListService: TaskListService,
    private navigatorService: TaskNavigatorUltraService,
    private transmutatorServive: TaskTransmutationService,
    private taskListRulesService: TaskListRulesService
  ) {}

  async ngOnInit() {
    await this.loadTasks();
  }

  private async loadTasks() {
    try {
      this.tasks = await this.taskListService.getOverlordTasks(ROOT_TASK_ID);
      if (!this.tasks) return;
      const extended = this.transmutatorServive.toExtendedTasks(this.tasks);
      const taskListKey: TaskListKey = {
        type: TaskListType.OVERLORD,
        data: ROOT_TASK_ID,
      };
      this.taskListRules = this.taskListRulesService.getList(taskListKey);
      this.navigatorService.loadAndInitializeTasks(extended, taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.tasks = null;
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
