import { Component, OnInit } from '@angular/core';
import { ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigation/task-navigator-ultra.service';
import {
  TaskListType,
  TaskListKey,
  TaskListRules,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

@Component({
  selector: 'app-root-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './root-task-list.component.html',
  styleUrl: './root-task-list.component.scss',
})
export class RootTaskListComponent implements OnInit {
  errorMessage: string = '';
  taskListRules: TaskListRules | null = null;

  constructor(
    private navigatorService: TaskNavigatorUltraService,
    private taskListRulesService: TaskListRulesService
  ) {}

  async ngOnInit() {
    await this.loadTasks();
  }

  private async loadTasks() {
    try {
      const taskListKey: TaskListKey = {
        type: TaskListType.OVERLORD,
        data: ROOT_TASK_ID,
      };
      this.taskListRules = this.taskListRulesService.getList(taskListKey);

      this.navigatorService.loadAndInitializeTasks(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
