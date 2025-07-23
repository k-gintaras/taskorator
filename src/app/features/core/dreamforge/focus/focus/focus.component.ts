import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { TaskTree } from '../../../../../models/taskTree';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { TaskoratorTask } from '../../../../../models/taskModelManager';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { MatIcon } from '@angular/material/icon';
import { TaskUiInteractionService } from '../../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskListService } from '../../../../../services/sync-api-cache/task-list.service';
import { SelectedMultipleComponent } from '../../../crucible/selected-multiple/selected-multiple.component';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [NgFor, StagedTaskListComponent, MatIcon, SelectedMultipleComponent],
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
})
export class FocusComponent implements OnInit {
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
      this.loadFocusTasks();
    });
    this.selectedTasks = this.getSelectedTasksSync();
  }

  private getSelectedTasksSync(): TaskoratorTask[] {
    const selectedIds = this.taskUiInteractionService.getSelectedTaskIds();
    // You may map IDs to full tasks if you have local cache; else return empty
    return [];
  }

  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks;
  }

  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks;
  }

  save(): void {
    this.settings.focusTaskIds = this.tasks.map((t) => t.taskId);
    this.settingsService.updateSettings(this.settings);
  }

  add(): void {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.focusTaskIds = [
      ...(this.settings.focusTaskIds || []),
      ...ids,
    ];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFocusTasks(): Promise<void> {
    this.tasks = (await this.taskListService.getFocusTasks()) || [];
  }
}
