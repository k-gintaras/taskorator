import { Component, OnInit } from '@angular/core';

import { TaskTree } from '../../../../../models/taskTree';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { TaskUiInteractionService } from '../../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskoratorTask, UiTask } from '../../../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { TaskListCoordinatorService } from '../../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskListKey, TaskListType, TaskListSubtype } from '../../../../../models/task-list-model';
import { TaskIdCacheService } from '../../../../../services/cache/task-id-cache.service';
import { getIdFromKey } from '../../../../../models/task-list-model';

@Component({
  selector: 'app-frog-task',
  standalone: true,
  imports: [MatIcon, MatTooltip, StagedTaskListComponent],
  templateUrl: './frog-task.component.html',
  styleUrls: ['./frog-task.component.scss'],
})
export class FrogTaskComponent implements OnInit {
  settings: TaskSettings = getDefaultTaskSettings();
  tree?: TaskTree;
  tasks: UiTask[] = [];
  selectedTasks: UiTask[] = [];

  constructor(
    private settingsService: SettingsService,
    private taskListCoordinator: TaskListCoordinatorService,
    private taskUiInteractionService: TaskUiInteractionService,
    private taskIdCache: TaskIdCacheService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((s) => {
      if (!s) return;
      this.settings = s;
      this.loadFrogTasks();
    });
    this.loadSelectedTasks();
  }

  private async loadSelectedTasks(): Promise<void> {
    const selectedIds = this.taskUiInteractionService.getSelectedTaskIds();
    this.selectedTasks = await this.taskListCoordinator.getTasksByIds(selectedIds);
  }

  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks as UiTask[];
  }

  onFrogTasksChange(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks as UiTask[];
    // Auto-save when frog tasks are modified
    this.settings.frogTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
    // Update cache
    const taskListKey: TaskListKey = {
      type: TaskListType.FROG,
      data: TaskListSubtype.SETTINGS,
    };
    const groupName = getIdFromKey(taskListKey);
    // Clear the existing group
    const cacheState = this.taskIdCache.getListCacheState(groupName);
    if (cacheState) {
      for (const task of cacheState.tasksWithData) {
        this.taskIdCache.removeTaskFromGroup(groupName, task.taskId);
      }
    }
    // Create new group with updated tasks
    this.taskIdCache.createNewGroup(updatedTasks as UiTask[], groupName);
  }

  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks as UiTask[];
  }

  save(): void {
    this.settings.frogTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
  }

  add(): void {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.frogTaskIds = [...(this.settings.frogTaskIds || []), ...ids];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFrogTasks(): Promise<void> {
    const taskListKey: TaskListKey = {
      type: TaskListType.FROG,
      data: TaskListSubtype.SETTINGS,
    };
    this.tasks = (await this.taskListCoordinator.getTasks(taskListKey)) || [];
  }
}
