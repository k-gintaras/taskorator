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
  selector: 'app-weekly-task-list',
  standalone: true,
  imports: [TaskNavigatorComponent],
  templateUrl: './weekly-task-list.component.html',
  styleUrl: './weekly-task-list.component.scss',
})
export class WeeklyTaskListComponent implements OnInit {
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
        type: TaskListType.WEEKLY,
        data: TaskListSubtype.REPEATING,
      };
      const overlordPlaceholder = getOverlordPlaceholder(taskListKey);
      this.selectedOverlordService.setSelectedOverlord(overlordPlaceholder);
      this.navigatorDataService.loadTaskList(taskListKey);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to load weekly tasks.';
      console.error(error);
    }
  }
}
