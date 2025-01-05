import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrogTaskService } from '../services/frog-task.service';
import { TaskTree, TaskTreeNode } from '../../../../../models/taskTree';
import {
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../../models/settings';
import { SettingsService } from '../../../../../services/core/settings.service';
import { SelectedMultipleService } from '../../../../../services/task/selected-multiple.service';
import { TaskListService } from '../../../../../services/tasks/task-list.service';
import { Task } from '../../../../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';

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
      this.loadFrogTasks().then();
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
