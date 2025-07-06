import { Component, OnInit } from '@angular/core';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListKey,
  TaskListRules,
  TaskListSubtype,
  TaskListType,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';
import { TaskNavigatorService } from '../../../../../services/tasks/task-navigation/task-navigator.service';

@Component({
  selector: 'app-weekly-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './weekly-task-list.component.html',
  styleUrl: './weekly-task-list.component.scss',
})
export class WeeklyTaskListComponent implements OnInit {
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
        type: TaskListType.WEEKLY,
        data: TaskListSubtype.REPEATING,
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
