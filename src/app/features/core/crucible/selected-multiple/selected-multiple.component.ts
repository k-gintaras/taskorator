import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TaskMiniComponent } from '../../../../components/task/task-mini/task-mini.component';
import { TaskSettings } from '../../../../models/settings';
import { UiTask } from '../../../../models/taskModelManager';
import { SettingsService } from '../../../../services/sync-api-cache/settings.service';
import { TaskUiInteractionService } from '../../../../services/tasks/task-list/task-ui-interaction.service';
import { SelectedOverlordService } from '../../../../services/tasks/selected/selected-overlord.service';
import { TaskSettingsTasksService } from '../../../../services/tasks/task-settings-tasks.service';
import { TaskBatchService } from '../../../../services/sync-api-cache/task-batch.service';
import { TaskActions } from '../../../../services/tasks/task-action-tracker.service';
import { TaskListCoordinatorService } from '../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskUiDecoratorService } from '../../../../services/tasks/task-list/task-ui-decorator.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-selected-multiple',
  standalone: true,
  imports: [
    TaskMiniComponent,
    CommonModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatButton,
  ],
  templateUrl: './selected-multiple.component.html',
  styleUrls: ['./selected-multiple.component.scss'],
})
export class SelectedMultipleComponent implements OnInit {
  selectedTasks: UiTask[] = [];
  selectedOverlord: UiTask | null = null;
  settings?: TaskSettings;
  private destroy$ = new Subject<void>();

  constructor(
    private taskUiInteractionService: TaskUiInteractionService,
    private taskUiDecoratorService: TaskUiDecoratorService,
    private taskBatchService: TaskBatchService,
    private settingsService: SettingsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskPriorityService: TaskSettingsTasksService,
    private taskListCoordinator: TaskListCoordinatorService
  ) {}

  ngOnInit() {
    this.refreshSelectedTasks();
    this.settingsService
      .getSettings()
      .subscribe((s) => (this.settings = s || undefined));
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((o) => {
        this.selectedOverlord = o;
      });
    this.taskUiDecoratorService.selectedTasksChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshSelectedTasks());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async refreshSelectedTasks() {
    const ids = this.taskUiInteractionService.getSelectedTaskIds();
    this.selectedTasks = await this.taskListCoordinator.getTasksByIds(ids);
  }

  clear() {
    this.taskUiInteractionService.clearSelection();
    this.refreshSelectedTasks();
  }

  async setFocus(reset = true) {
    if (!this.settings || this.selectedTasks.length === 0) return;
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
    if (!this.settings || this.selectedTasks.length === 0) return;
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
    if (!this.settings || this.selectedTasks.length === 0) return;
    if (reset) {
      this.settings.favoriteTaskIds = this.selectedTasks.map((t) => t.taskId);
      await this.settingsService.updateSettings(this.settings);
    } else {
      for (const task of this.selectedTasks) {
        await this.taskPriorityService.addTaskToFavorites(task);
      }
    }
  }

  async onTaskCardClick(task: UiTask) {
    if (task.isSelected) {
      this.taskUiInteractionService.unselect(task.taskId);
    } else {
      this.taskUiInteractionService.select(task.taskId);
    }
    await this.refreshSelectedTasks();
  }

  async setNewOverlordForSelectedTasks() {
    if (!this.selectedOverlord) {
      alert('Please select an overlord.');
      return;
    }

    this.selectedTasks.forEach((task) => {
      task.overlord = this.selectedOverlord!.taskId;
    });

    await this.taskBatchService.updateTaskBatch(
      this.selectedTasks,
      TaskActions.MOVED,
      this.selectedOverlord
    );

    await this.refreshSelectedTasks();
  }
}
