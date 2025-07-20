import { Component, OnInit } from '@angular/core';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListRules,
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../../../../models/task-list-model';
import { getOverlordPlaceholder } from '../../../../../services/tasks/task-list/task-list-overlord-placeholders';
import { SelectedOverlordService } from '../../../../../services/tasks/selected/selected-overlord.service';
import { TaskListDataFacadeService } from '../../../../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  selector: 'app-daily-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './daily-task-list.component.html',
  styleUrl: './daily-task-list.component.scss',
})
export class DailyTaskListComponent implements OnInit {
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
        type: TaskListType.DAILY,
        data: TaskListSubtype.REPEATING,
      };
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.loadTaskList(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load daily tasks.';
      console.error(error);
    }
  }
}
