import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { CreateTaskComponent } from '../../../../../components/task/create-task/create-task.component';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskListService } from '../../../../../services/tasks/task-list.service';
import { TaskTransmutationService } from '../../../../../services/tasks/task-transmutation.service';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-daily-task-list',
  standalone: true,
  imports: [CreateTaskComponent, TaskNavigatorComponent, NgFor],
  templateUrl: './daily-task-list.component.html',
  styleUrl: './daily-task-list.component.scss',
})
export class DailyTaskListComponent implements OnInit {
  getTasksName() {
    return this.tasks?.map((t) => t.stage).join(', ');
  }
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
      this.tasks = await this.taskListService.getDailyTasks();
      if (!this.tasks) return;
      const extended = this.transmutatorServive.toExtendedTasks(this.tasks);
      const taskListKey: TaskListKey = {
        type: TaskListType.DAILY,
        data: TaskListSubtype.REPEATING,
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
