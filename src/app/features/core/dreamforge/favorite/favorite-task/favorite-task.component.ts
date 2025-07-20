import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskTree } from '../../../../../models/taskTree';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { TaskUiInteractionService } from '../../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskoratorTask } from '../../../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { TaskListService } from '../../../../../services/sync-api-cache/task-list.service';

@Component({
  selector: 'app-favorite-task',
  standalone: true,
  imports: [CommonModule, MatIcon, StagedTaskListComponent],
  templateUrl: './favorite-task.component.html',
  styleUrls: ['./favorite-task.component.scss'],
})
export class FavoriteTaskComponent implements OnInit {
  settings: TaskSettings = getDefaultTaskSettings();
  tree?: TaskTree;
  tasks: TaskoratorTask[] = [];
  selectedTasks: TaskoratorTask[] = [];

  constructor(
    private settingsService: SettingsService,
    private taskListService: TaskListService,
    private taskUiInteractionService: TaskUiInteractionService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((s) => {
      if (!s) return;
      this.settings = s;
      this.loadFavoriteTasks();
    });
    this.selectedTasks = this.getSelectedTasksSync();
  }

  private getSelectedTasksSync(): TaskoratorTask[] {
    const selectedIds = this.taskUiInteractionService.getSelectedTaskIds();
    // Map IDs to tasks if you have cache, else return empty
    return [];
  }

  save(): void {
    this.settings.favoriteTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
  }

  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks;
  }

  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks;
  }

  add(): void {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.favoriteTaskIds = [
      ...(this.settings.favoriteTaskIds || []),
      ...ids,
    ];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFavoriteTasks(): Promise<void> {
    this.tasks = (await this.taskListService.getFavoriteTasks()) || [];
  }
}
