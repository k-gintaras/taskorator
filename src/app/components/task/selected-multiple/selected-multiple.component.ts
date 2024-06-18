import { Component, OnInit } from '@angular/core';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { Task } from '../../../models/taskModelManager';
import { TaskMiniComponent } from '../../task-mini/task-mini.component';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task/task.service';
import { TreeService } from '../../../services/core/tree.service';
import { TaskTreeNode } from '../../../models/taskTree';
import { TreeNodeService } from '../../../services/core/tree-node.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Observable } from 'rxjs/internal/Observable';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/internal/operators/map';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButton } from '@angular/material/button';
import { SettingsService } from '../../../services/core/settings.service';
import { TaskSettings } from '../../../models/settings';
import { SearchOverlordComponent } from '../../search-overlord/search-overlord.component';
import { SelectedOverlordService } from '../../../services/task/selected-overlord.service';
import { TaskPriorityService } from '../../../services/task/task-priority.service';

@Component({
  selector: 'app-selected-multiple',
  standalone: true,
  imports: [
    TaskMiniComponent,
    CommonModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatButton,
    SearchOverlordComponent,
  ],
  templateUrl: './selected-multiple.component.html',
  styleUrl: './selected-multiple.component.scss',
})
export class SelectedMultipleComponent implements OnInit {
  selectedTasks: Task[] = [];
  selectedOverlord: Task | undefined;
  settings: TaskSettings | undefined = undefined;
  filteredTaskOptions: Observable<Task[]> | undefined;

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private taskService: TaskService,
    private settingsService: SettingsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskPriorityService: TaskPriorityService
  ) {}

  ngOnInit() {
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
    this.loadSettings();
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((t: Task | null) => {
        if (!t) return;
        this.selectedOverlord = t;
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

  onTaskCardClick(task: Task) {
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
      this.taskService.updateTask(task).then(() => {
        console.log(
          `Task ${task.taskId} updated with new overlord ${o.taskId}`
        );
      });
    });
  }
}
