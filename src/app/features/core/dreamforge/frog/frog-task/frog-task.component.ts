import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskTree } from '../../../../../models/taskTree';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { SettingsService } from '../../../../../services/sync-api-cache/settings.service';
import { SelectedMultipleService } from '../../../../../services/tasks/selected/selected-multiple.service';
import { TaskoratorTask } from '../../../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { TaskListService } from '../../../../../services/sync-api-cache/task-list.service';

@Component({
  selector: 'app-frog-task',
  standalone: true,
  imports: [CommonModule, MatIcon, StagedTaskListComponent],
  templateUrl: './frog-task.component.html',
  styleUrl: './frog-task.component.scss',
})
export class FrogTaskComponent implements OnInit {
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
      this.loadFrogTasks().then();
    });
    this.selectedTasksService
      .getSelectedTasks()
      .subscribe((t: TaskoratorTask[]) => {
        this.selectedTasks = t;
      });
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

  save() {
    const ids = this.tasks.map((t) => t.taskId);
    this.settings.frogTaskIds = ids;
    this.settingsService.updateSettings(this.settings);
  }

  add() {
    const ids = this.selectedTasks.map((t) => t.taskId);
    this.tasks = [...this.tasks, ...this.selectedTasks];
    this.settings.frogTaskIds = [...this.settings.frogTaskIds, ...ids];
    this.settingsService.updateSettings(this.settings);
  }

  async loadFrogTasks() {
    this.tasks = (await this.taskListService.getFrogTasks()) || [];
  }
}
