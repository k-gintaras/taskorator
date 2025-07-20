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
  selector: 'app-frog-task',
  standalone: true,
  imports: [CommonModule, MatIcon, StagedTaskListComponent],
  templateUrl: './frog-task.component.html',
  styleUrls: ['./frog-task.component.scss'],
})
export class FrogTaskComponent implements OnInit {
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
      this.loadFrogTasks();
    });
    this.selectedTasks = this.getSelectedTasksSync();
  }

  private getSelectedTasksSync(): TaskoratorTask[] {
    const selectedIds = this.taskUiInteractionService.getSelectedTaskIds();
    // Optionally map IDs to tasks if you have cache or service, else empty array:
    // Here just return empty array as no direct sync tasks array available
    return [];
  }

  updateTasks(updatedTasks: TaskoratorTask[]): void {
    this.tasks = updatedTasks;
  }

  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks;
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
    this.tasks = (await this.taskListService.getFrogTasks()) || [];
  }
}
