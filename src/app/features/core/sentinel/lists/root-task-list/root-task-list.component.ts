import { Component, OnInit } from '@angular/core';
import { ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListType,
  TaskListKey,
  TaskListRules,
} from '../../../../../models/task-list-model';
import { TaskListCoordinatorService } from '../../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskNavigatorDataService } from '../../../../../services/tasks/task-navigation/task-navigator-data.service';
import { getOverlordPlaceholder } from '../../../../../services/tasks/task-list/task-list-overlord-placeholders';
import { SelectedOverlordService } from '../../../../../services/tasks/selected/selected-overlord.service';

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
    private taskListCoordinatorService: TaskListCoordinatorService,
    private navigatorDataService: TaskNavigatorDataService,
    private selectedOverlordService: SelectedOverlordService
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
      const tasks = await this.taskListCoordinatorService.getProcessedTaskList(
        taskListKey
      );
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.setTasks(tasks, taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load root tasks.';
      console.error(error);
    }
  }
}
