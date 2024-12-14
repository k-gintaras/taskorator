import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { CreateTaskComponent } from '../../../../../components/task/create-task/create-task.component';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskListService } from '../../../../../services/tasks/task-list.service';
import { TaskTransmutationService } from '../../../../../services/tasks/task-transmutation.service';
import {
  TaskListKey,
  TaskListRules,
  TaskListSubtype,
  TaskListType,
} from '../../../../../models/task-list-model';
import { TaskListRulesService } from '../../../../../services/tasks/task-list-rules.service';

@Component({
  selector: 'app-weekly-task-list',
  standalone: true,
  imports: [CreateTaskComponent, TaskNavigatorComponent],
  templateUrl: './weekly-task-list.component.html',
  styleUrl: './weekly-task-list.component.scss',
})
export class WeeklyTaskListComponent implements OnInit {
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
      this.tasks = await this.taskListService.getWeeklyTasks();
      if (!this.tasks) return;
      const extended = this.transmutatorServive.toExtendedTasks(this.tasks);
      const taskListKey: TaskListKey = {
        type: TaskListType.WEEKLY,
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
