import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskTree } from '../../../../../models/taskTree';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { SelectedMultipleService } from '../../../../../services/tasks/selected-multiple.service';
import { TaskoratorTask } from '../../../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { TaskListService } from '../../../../../services/sync-api-cache/task-list.service';

@Component({
  selector: 'app-favorite-task',
  standalone: true,
  imports: [CommonModule, MatIcon, StagedTaskListComponent],
  templateUrl: './favorite-task.component.html',
  styleUrl: './favorite-task.component.scss',
})
export class FavoriteTaskComponent implements OnInit {
  settings: TaskSettings = getDefaultTaskSettings();
  tree: TaskTree | undefined;
  tasks: TaskoratorTask[] | [] = [];
  selectedTasks: TaskoratorTask[] | [] = [];

  constructor(
    private settingsService: SettingsService,
    private taskListService: TaskListService,
    private selectedTasksService: SelectedMultipleService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (!s) return;
      this.settings = s;
      this.loadFavoriteTasks().then();
    });
    this.selectedTasksService
      .getSelectedTasks()
      .subscribe((t: TaskoratorTask[]) => {
        this.selectedTasks = t;
      });
  }

  save() {
    const ids = this.tasks.map((t) => t.taskId);
    this.settings.favoriteTaskIds = ids;
    this.settingsService.updateSettings(this.settings);
  }

  /**
   * @param updatedTasks come from staged task list allowing us delete them easily
   */
  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks;
  }
  /**
   * @param updatedTasks come from staged task list allowing us delete them easily
   */
  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks;
  }

  add() {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.favoriteTaskIds = [...this.settings.favoriteTaskIds, ...ids];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFavoriteTasks() {
    this.tasks = (await this.taskListService.getFavoriteTasks()) || [];
  }
}
