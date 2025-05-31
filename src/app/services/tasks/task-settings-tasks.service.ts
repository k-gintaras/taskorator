import { Injectable } from '@angular/core';
import { SettingsService } from '../sync-api-cache/settings.service';
import { TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
/**
 * @fix or @deprecated use ExtendedTask for ui... or extend task to have "selected" property
 */
@Injectable({
  providedIn: 'root',
})
export class TaskSettingsTasksService {
  settings: TaskSettings | undefined;

  constructor(private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) this.settings = s;
    });
  }

  private async updateSettings() {
    if (this.settings) {
      await this.settingsService.updateSettings(this.settings);
    }
  }

  async addTaskToFocus(task: Task) {
    if (!this.settings) return;

    if (!this.settings.focusTaskIds.includes(task.taskId)) {
      this.settings.focusTaskIds.push(task.taskId);
      await this.updateSettings();
      console.log('Task added to focus:', task.taskId);
    }
  }

  async removeTaskFromFocus(task: Task) {
    if (!this.settings) return;

    const index = this.settings.focusTaskIds.indexOf(task.taskId);
    if (index > -1) {
      this.settings.focusTaskIds.splice(index, 1);
      await this.updateSettings();
      console.log('Task removed from focus:', task.taskId);
    }
  }

  async addTaskToFrogs(task: Task) {
    if (!this.settings) return;

    if (!this.settings.frogTaskIds.includes(task.taskId)) {
      this.settings.frogTaskIds.push(task.taskId);
      await this.updateSettings();
      console.log('Task added to frogs:', task.taskId);
    }
  }

  async removeTaskFromFrogs(task: Task) {
    if (!this.settings) return;

    const index = this.settings.frogTaskIds.indexOf(task.taskId);
    if (index > -1) {
      this.settings.frogTaskIds.splice(index, 1);
      await this.updateSettings();
      console.log('Task removed from frogs:', task.taskId);
    }
  }

  async addTaskToFavorites(task: Task) {
    if (!this.settings) return;

    if (!this.settings.favoriteTaskIds.includes(task.taskId)) {
      this.settings.favoriteTaskIds.push(task.taskId);
      await this.updateSettings();
      console.log('Task added to favorites:', task.taskId);
    }
  }

  async removeTaskFromFavorites(task: Task) {
    if (!this.settings) return;

    const index = this.settings.favoriteTaskIds.indexOf(task.taskId);
    if (index > -1) {
      this.settings.favoriteTaskIds.splice(index, 1);
      await this.updateSettings();
      console.log('Task removed from favorites:', task.taskId);
    }
  }
}
