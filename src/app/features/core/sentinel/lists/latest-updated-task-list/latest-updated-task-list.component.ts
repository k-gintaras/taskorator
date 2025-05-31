import { Component, OnInit } from '@angular/core';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListKey,
  TaskListRules,
  TaskListSubtype,
  TaskListType,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

@Component({
  selector: 'app-latest-updated-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './latest-updated-task-list.component.html',
  styleUrl: './latest-updated-task-list.component.scss',
})
export class LatestUpdatedTaskListComponent implements OnInit {
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
        type: TaskListType.LATEST_UPDATED,
        data: TaskListSubtype.API,
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
