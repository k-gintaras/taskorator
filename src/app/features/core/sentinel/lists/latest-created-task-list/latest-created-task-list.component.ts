import { Component, OnInit } from '@angular/core';
import { TaskNavigatorService } from '../../../../../services/tasks/task-navigation/task-navigator.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

@Component({
  selector: 'app-latest-created-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './latest-created-task-list.component.html',
  styleUrl: './latest-created-task-list.component.scss',
})
export class LatestCreatedTaskListComponent implements OnInit {
  errorMessage: string = '';
  taskListRules: TaskListRules | null = null;

  constructor(
    private navigatorService: TaskNavigatorService,
    private taskListRulesService: TaskListRulesService
  ) {}

  async ngOnInit() {
    await this.loadTasks();
  }

  private async loadTasks() {
    try {
      const taskListKey: TaskListKey = {
        type: TaskListType.LATEST_CREATED,
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
