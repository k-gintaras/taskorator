import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Observable } from 'rxjs';
import { SearchOverlordComponent } from '../../../../components/search-overlord/search-overlord.component';
import { TaskMiniComponent } from '../../../../components/task/task-mini/task-mini.component';
import { TaskSettings } from '../../../../models/settings';
import {
  ExtendedTask,
  TaskoratorTask,
} from '../../../../models/taskModelManager';
import { SettingsService } from '../../../../services/sync-api-cache/settings.service';
import { SelectedMultipleService } from '../../../../services/tasks/selected/selected-multiple.service';
import { SelectedOverlordService } from '../../../../services/tasks/selected/selected-overlord.service';
import { TaskSettingsTasksService } from '../../../../services/tasks/task-settings-tasks.service';
import { TaskBatchService } from '../../../../services/sync-api-cache/task-batch.service';
import { TaskActions } from '../../../../services/tasks/task-action-tracker.service';

@Component({
  selector: 'app-selected-multiple',
  standalone: true,
  imports: [
    TaskMiniComponent,
    CommonModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatButton,
    SearchOverlordComponent,
  ],
  templateUrl: './selected-multiple.component.html',
  styleUrl: './selected-multiple.component.scss',
})
export class SelectedMultipleComponent implements OnInit {
  selectedTasks: TaskoratorTask[] = [];
  selectedOverlord: ExtendedTask | null = null;
  settings: TaskSettings | undefined = undefined;
  filteredTaskOptions: Observable<TaskoratorTask[]> | undefined;

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private taskBatchService: TaskBatchService,
    private settingsService: SettingsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskPriorityService: TaskSettingsTasksService
  ) {}

  ngOnInit() {
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: TaskoratorTask[]) => {
        this.selectedTasks = selectedTasks;
      });
    this.loadSettings();
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: ExtendedTask | null) => {
        if (overlord) {
          this.selectedOverlord = overlord;
        }
      });
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (!s) return;
      this.settings = s;
    });
  }

  clear() {
    this.selectedMultiple.clear();
    this.selectedTasks = [];
  }

  async setFocus(reset: boolean = true) {
    if (
      !this.settings ||
      !this.selectedTasks ||
      this.selectedTasks.length === 0
    ) {
      console.error('Settings are not initialized or no tasks are selected.');
      return;
    }
    if (reset) {
      this.settings.focusTaskIds = this.selectedTasks.map(
        (task) => task.taskId
      );
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFocus(task);
      }
    }
  }

  async setFrogs(reset: boolean = true) {
    if (
      !this.settings ||
      !this.selectedTasks ||
      this.selectedTasks.length === 0
    ) {
      console.error('Settings are not initialized or no tasks are selected.');
      return;
    }
    if (reset) {
      this.settings.frogTaskIds = this.selectedTasks.map((task) => task.taskId);
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFrogs(task);
      }
    }
  }

  async setFavorites(reset: boolean = true) {
    if (
      !this.settings ||
      !this.selectedTasks ||
      this.selectedTasks.length === 0
    ) {
      console.error('Settings are not initialized or no tasks are selected.');
      return;
    }
    if (reset) {
      this.settings.favoriteTaskIds = this.selectedTasks.map(
        (task) => task.taskId
      );
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFavorites(task);
      }
    }
  }

  onTaskCardClick(task: TaskoratorTask) {
    if (this.selectedTasks.indexOf(task) > -1) {
      this.selectedMultiple.removeSelectedTask(task);
    } else {
      this.selectedMultiple.addSelectedTask(task);
    }
  }

  setNewOverlordForSelectedTasks() {
    const o = this.selectedOverlord;
    if (!o) {
      alert('Please select an overlord from the list.');
      return;
    }

    this.selectedTasks.forEach((task) => {
      task.overlord = o.taskId;
    });

    this.taskBatchService
      .updateTaskBatch(this.selectedTasks, TaskActions.MOVED, o)
      .then(() => {
        console.log(
          `Task ${this.selectedTasks.map(
            (t) => t.name
          )} updated with new overlord ${o}`
        );
      });
  }
}
