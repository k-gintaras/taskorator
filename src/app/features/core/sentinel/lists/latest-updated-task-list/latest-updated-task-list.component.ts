import { Component, OnInit } from '@angular/core';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListKey,
  TaskListRules,
  TaskListSubtype,
  TaskListType,
} from '../../../../../models/task-list-model';
import { getOverlordPlaceholder } from '../../../../../services/tasks/task-list/task-list-overlord-placeholders';
import { SelectedOverlordService } from '../../../../../services/tasks/selected/selected-overlord.service';
import { TaskListDataFacadeService } from '../../../../../services/tasks/task-list/task-list-data-facade.service';

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
    private navigatorDataService: TaskListDataFacadeService,
    private selectedOverlordService: SelectedOverlordService
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
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.loadTaskList(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load latest updated tasks.';
      console.error(error);
    }
  }
}
