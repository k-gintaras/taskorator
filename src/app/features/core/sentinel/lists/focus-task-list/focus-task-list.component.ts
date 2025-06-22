import { Component, OnInit } from '@angular/core';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigation/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

@Component({
  selector: 'app-focus-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './focus-task-list.component.html',
  styleUrl: './focus-task-list.component.scss',
})
export class FocusTaskListComponent implements OnInit {
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
        type: TaskListType.FOCUS,
        data: TaskListSubtype.SETTINGS,
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
