import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { TaskTree } from '../../../../../models/taskTree';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { Task } from '../../../../../models/taskModelManager';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { MatIcon } from '@angular/material/icon';
import { SelectedMultipleService } from '../../../../../services/tasks/selected-multiple.service';
import { TaskListService } from '../../../../../services/sync-api-cache/task-list.service';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [NgFor, StagedTaskListComponent, MatIcon],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss',
})
export class FocusComponent implements OnInit {
  settings: TaskSettings = getDefaultTaskSettings();
  tree: TaskTree | undefined;
  tasks: Task[] | [] = [];
  selectedTasks: Task[] | [] = [];

  constructor(
    private settingsService: SettingsService,
    private taskListService: TaskListService,
    private selectedTasksService: SelectedMultipleService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (!s) return;
      this.settings = s;
      this.loadFocusTasks().then();
    });
    this.selectedTasksService.getSelectedTasks().subscribe((t: Task[]) => {
      this.selectedTasks = t;
    });
  }

  /**
   * @param updatedTasks come from staged task list allowing us delete them easily
   */
  updateTasks(updatedTasks: Task[]): void {
    this.tasks = updatedTasks;
  }
  /**
   * @param updatedTasks come from staged task list allowing us delete them easily
   */
  updateSelectedTasks(updatedTasks: Task[]): void {
    this.selectedTasks = updatedTasks;
  }

  save() {
    const ids = this.tasks.map((t) => t.taskId);
    this.settings.focusTaskIds = ids;
    this.settingsService.updateSettings(this.settings);
  }

  add() {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.focusTaskIds = [...this.settings.focusTaskIds, ...ids];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFocusTasks() {
    this.tasks = (await this.taskListService.getFocusTasks()) || [];
  }
}
