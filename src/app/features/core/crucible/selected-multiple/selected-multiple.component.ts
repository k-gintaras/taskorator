import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Observable } from 'rxjs';
import { SearchOverlordComponent } from '../../../../components/search-overlord/search-overlord.component';
import { TaskMiniComponent } from '../../../../components/task/task-mini/task-mini.component';
import { TaskSettings } from '../../../../models/settings';
import { UiTask, TaskoratorTask } from '../../../../models/taskModelManager';
import { SettingsService } from '../../../../services/sync-api-cache/settings.service';
import { TaskUiInteractionService } from '../../../../services/tasks/task-list/task-ui-interaction.service';
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
  styleUrls: ['./selected-multiple.component.scss'],
})
export class SelectedMultipleComponent implements OnInit {
  selectedTasks: TaskoratorTask[] = [];
  selectedOverlord: UiTask | null = null;
  settings?: TaskSettings;
  filteredTaskOptions?: Observable<TaskoratorTask[]>;

  constructor(
    private taskUiInteractionService: TaskUiInteractionService,
    private taskBatchService: TaskBatchService,
    private settingsService: SettingsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskPriorityService: TaskSettingsTasksService
  ) {}

  ngOnInit() {
    this.selectedTasks = this.getSelectedTasksSync();
    this.settingsService.getSettings().subscribe((s) => {
      if (!s) return;
      this.settings = s;
    });
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord) => {
        if (overlord) this.selectedOverlord = overlord;
      });
  }

  private getSelectedTasksSync(): TaskoratorTask[] {
    const ids = this.taskUiInteractionService.getSelectedTaskIds();
    // Map ids to tasks if you have cached tasks; else empty array
    return [];
  }

  clear() {
    this.taskUiInteractionService.clearSelection();
    this.selectedTasks = [];
  }

  async setFocus(reset = true) {
    if (!this.settings || this.selectedTasks.length === 0) {
      console.error('Settings not initialized or no tasks selected.');
      return;
    }
    if (reset) {
      this.settings.focusTaskIds = this.selectedTasks.map((t) => t.taskId);
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFocus(task);
      }
    }
  }

  async setFrogs(reset = true) {
    if (!this.settings || this.selectedTasks.length === 0) {
      console.error('Settings not initialized or no tasks selected.');
      return;
    }
    if (reset) {
      this.settings.frogTaskIds = this.selectedTasks.map((t) => t.taskId);
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFrogs(task);
      }
    }
  }

  async setFavorites(reset = true) {
    if (!this.settings || this.selectedTasks.length === 0) {
      console.error('Settings not initialized or no tasks selected.');
      return;
    }
    if (reset) {
      this.settings.favoriteTaskIds = this.selectedTasks.map((t) => t.taskId);
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFavorites(task);
      }
    }
  }

  onTaskCardClick(task: TaskoratorTask) {
    if (this.selectedTasks.includes(task)) {
      this.taskUiInteractionService.unselect(task.taskId);
    } else {
      this.taskUiInteractionService.select(task.taskId);
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
          `Tasks ${this.selectedTasks
            .map((t) => t.name)
            .join(', ')} updated with new overlord ${o}`
        );
      });
  }
}
