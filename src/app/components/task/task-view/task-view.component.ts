import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { UiTask, ROOT_TASK_ID } from '../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
} from '../../../models/task-list-model';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';
import { TaskListDataFacadeService } from '../../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  standalone: true,
  imports: [TaskNavigatorComponent],
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
})
export class TaskViewComponent implements OnInit {
  task: UiTask | null = null;
  errorMessage: string = '';
  taskListRules: TaskListRules | null = null;

  // Context awareness
  listContext: string | null = null;
  taskListType: string | null = null;
  backUrl: string = '/sentinel';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private navigatorDataService: TaskListDataFacadeService,
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
    this.selectedOverlordService.setSelectedOverlord(this.task);
    this.navigatorDataService.loadTaskList(taskListKey);
  }
}
