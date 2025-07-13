import { Component, OnInit } from '@angular/core';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../../../models/task-list-model';
import { TaskListCoordinatorService } from '../../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskNavigatorDataService } from '../../../../../services/tasks/task-navigation/task-navigator-data.service';
import { getOverlordPlaceholder } from '../../../../../services/tasks/task-list/task-list-overlord-placeholders';
import { SelectedOverlordService } from '../../../../../services/tasks/selected/selected-overlord.service';

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
        type: TaskListType.LATEST_CREATED,
        data: TaskListSubtype.API,
      };
      const tasks = await this.taskListCoordinatorService.getTasks(taskListKey);
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.setTasks(tasks, taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load latest created tasks.';
      console.error(error);
    }
  }
}
