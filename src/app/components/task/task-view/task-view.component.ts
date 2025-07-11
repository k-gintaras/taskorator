import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { ExtendedTask, ROOT_TASK_ID } from '../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../models/task-list-model';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';
import { TaskNavigatorHistoryService } from '../../../services/tasks/task-navigation/task-navigator-history.service';
import { TaskListCoordinatorService } from '../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskNavigatorDataService } from '../../../services/tasks/task-navigation/task-navigator-data.service';

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

  // Context awareness
  listContext: string | null = null;
  taskListType: string | null = null;
  backUrl: string = '/sentinel';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private navigatorHistoryService: TaskNavigatorHistoryService,
    private taskListCoordinatorService: TaskListCoordinatorService,
    private navigatorDataService: TaskNavigatorDataService,
    private selectedOverlordService: SelectedOverlordService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const taskId = params.get('taskId');

      // Get context from route data
      this.listContext = this.route.snapshot.data['listContext'] || null;
      this.taskListType = this.route.snapshot.data['taskListType'] || null;

      // Set back URL based on context
      if (this.listContext) {
        this.backUrl = `/sentinel/${this.listContext}`;
      }

      if (taskId) {
        await this.loadTask(taskId);
        this.updateNavigationHistory(taskId);
      }
    });
  }

  private async loadTask(taskId: string) {
    this.task = await this.taskService.getTaskById(taskId);
    if (!this.task) return; // TODO: prolly error m8

    const taskListKey: TaskListKey = {
      type: TaskListType.OVERLORD,
      data: this.task?.taskId || ROOT_TASK_ID,
    };
    const tasks = await this.taskListCoordinatorService.getProcessedTaskList(
      taskListKey
    );
    this.selectedOverlordService.setSelectedOverlord(this.task);
    this.navigatorDataService.setTasks(tasks, taskListKey);
  }

  private updateNavigationHistory(taskId: string) {
    if (this.listContext && this.taskListType) {
      // Create appropriate TaskListKey based on context
      const taskListKey = this.createTaskListKeyFromContext();

      // Update navigation history with context
      this.navigatorHistoryService.pushNavigation(
        taskListKey,
        taskId,
        this.task?.name || taskId
      );
    }
  }

  private createTaskListKeyFromContext(): TaskListKey {
    // Map context to proper TaskListKey
    switch (this.taskListType) {
      case 'DAILY':
        return { type: TaskListType.DAILY, data: TaskListSubtype.REPEATING };
      case 'WEEKLY':
        return { type: TaskListType.WEEKLY, data: TaskListSubtype.REPEATING };
      case 'LATEST_CREATED':
        return {
          type: TaskListType.LATEST_CREATED,
          data: TaskListSubtype.API,
        };
      case 'LATEST_UPDATED':
        return {
          type: TaskListType.LATEST_UPDATED,
          data: TaskListSubtype.API,
        };
      case 'FOCUS':
        return { type: TaskListType.FOCUS, data: TaskListSubtype.API };
      case 'OVERLORD':
        return { type: TaskListType.OVERLORD, data: TaskListSubtype.API };
      default:
        return { type: TaskListType.OVERLORD, data: TaskListSubtype.API }; // fallback
    }
  }

  goBack() {
    this.router.navigate([this.backUrl]);
  }

  // Navigate to child task (hierarchical navigation)
  navigateToChildTask(childTaskId: string) {
    if (this.listContext) {
      // Stay within the same context when navigating to children
      this.router.navigate([
        `/sentinel/${this.listContext}/tasks/${childTaskId}`,
      ]);
    } else {
      // Fallback to direct task navigation
      this.router.navigate([`/tasks/${childTaskId}`]);
    }
  }
}
