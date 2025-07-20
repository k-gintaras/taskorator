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
    private navigatorDataService: TaskListDataFacadeService,
    private selectedOverlordService: SelectedOverlordService
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
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.loadTaskList(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load focus tasks.';
      console.error(error);
    }
  }
}
