import { Component, OnInit } from '@angular/core';
import { ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListType,
  TaskListKey,
  TaskListRules,
} from '../../../../../models/task-list-model';
import { getOverlordPlaceholder } from '../../../../../services/tasks/task-list/task-list-overlord-placeholders';
import { SelectedOverlordService } from '../../../../../services/tasks/selected/selected-overlord.service';
import { TaskListDataFacadeService } from '../../../../../services/tasks/task-list/task-list-data-facade.service';

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
    private navigatorDataService: TaskListDataFacadeService,
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
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.loadTaskList(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load root tasks.';
      console.error(error);
    }
  }
}
