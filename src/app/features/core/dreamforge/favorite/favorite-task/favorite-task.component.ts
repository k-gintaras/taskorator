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
  selector: 'app-favorite-task',
  standalone: true,
  imports: [MatIcon, MatTooltip, StagedTaskListComponent],
  templateUrl: './favorite-task.component.html',
  styleUrls: ['./favorite-task.component.scss'],
})
export class FavoriteTaskComponent implements OnInit {
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
      this.loadFavoriteTasks();
    });
    this.loadSelectedTasks();
  }

  private async loadSelectedTasks(): Promise<void> {
    const selectedIds = this.taskUiInteractionService.getSelectedTaskIds();
    this.selectedTasks = await this.taskListCoordinator.getTasksByIds(selectedIds);
  }

  save(): void {
    this.settings.favoriteTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
  }

  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks as UiTask[];
  }

  onFavoriteTasksChange(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks as UiTask[];
    this.settings.favoriteTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
    // Update cache
    const taskListKey: TaskListKey = {
      type: TaskListType.FAVORITE,
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

  add(): void {
    const ids = this.selectedTasks.map((t) => t.taskId);
    // Merge current tasks and selected tasks, deduplicate by taskId
    const merged = [...this.tasks, ...this.selectedTasks];
    const uniqueMap = new Map<string, TaskoratorTask>();
    for (const t of merged) {
      uniqueMap.set(t.taskId, t);
    }
    const uniqueTasks = Array.from(uniqueMap.values());
    // Use the centralized change handler to update settings and cache
    this.onFavoriteTasksChange(uniqueTasks);
  }

  async loadFavoriteTasks(): Promise<void> {
    const taskListKey: TaskListKey = {
      type: TaskListType.FAVORITE,
      data: TaskListSubtype.SETTINGS,
    };
    this.tasks = (await this.taskListCoordinator.getTasks(taskListKey)) || [];
  }
}
