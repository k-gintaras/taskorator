import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { ExtendedTask, ROOT_TASK_ID } from '../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
} from '../../../models/task-list-model';
import { TaskListRulesService } from '../../../services/tasks/task-list-rules.service';
import { TaskNavigatorUltraService } from '../../../services/tasks/task-navigator-ultra.service';
import { SelectedOverlordService } from '../../../services/tasks/selected-overlord.service';

@Component({
  standalone: true,
  imports: [TaskNavigatorComponent],
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
})
export class TaskViewComponent implements OnInit {
  task: ExtendedTask | null = null;

  errorMessage: string = '';
  taskListRules: TaskListRules | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private taskListRulesService: TaskListRulesService,
    private navigatorService: TaskNavigatorUltraService,
    private selectedOverlordService: SelectedOverlordService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const taskId = params.get('taskId');
      if (taskId) {
        const taskListKey: TaskListKey = {
          type: TaskListType.OVERLORD,
          data: taskId,
        };
        this.selectedOverlordService.setSelectedOverlord(taskId);
        this.taskListRules = this.taskListRulesService.getList(taskListKey);
        await this.navigatorService.loadAndInitializeTasks(taskListKey);
        this.loadTask(taskId); // optional, if you want single task details
      }
    });
  }

  private loadTask(taskId: string) {
    this.taskService.getTaskById(taskId).then((task) => {
      this.task = task;
    });
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
