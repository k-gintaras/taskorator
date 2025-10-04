import { Injectable } from '@angular/core';
import { SettingsService } from '../sync-api-cache/settings.service';
import { TaskSettings } from '../../models/settings';
import { TaskoratorTask } from '../../models/taskModelManager';
/**
 * @fix or @deprecated use ExtendedTask for ui... or extend task to have "selected" property
 */
@Injectable({
  providedIn: 'root',
})
export class TaskSettingsTasksService {
  constructor(private settingsService: SettingsService) {}

  private async getCurrentSettings(): Promise<TaskSettings | null> {
    return new Promise((resolve) => {
      const subscription = this.settingsService.getSettings().subscribe((settings) => {
        subscription.unsubscribe();
        resolve(settings);
      });
    });
  }

  private async updateSettingsWithTask(settings: TaskSettings, taskId: string, arrayName: keyof TaskSettings): Promise<void> {
    const array = settings[arrayName] as string[];
    if (!array.includes(taskId)) {
      array.push(taskId);
      await this.settingsService.updateSettings(settings);
    }
  }

  async addTaskToFocus(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    await this.updateSettingsWithTask(settings, task.taskId, 'focusTaskIds');
  }

  async removeTaskFromFocus(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    const index = settings.focusTaskIds.indexOf(task.taskId);
    if (index > -1) {
      settings.focusTaskIds.splice(index, 1);
      await this.settingsService.updateSettings(settings);
    }
  }

  async addTaskToFrogs(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    await this.updateSettingsWithTask(settings, task.taskId, 'frogTaskIds');
  }

  async removeTaskFromFrogs(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    const index = settings.frogTaskIds.indexOf(task.taskId);
    if (index > -1) {
      settings.frogTaskIds.splice(index, 1);
      await this.settingsService.updateSettings(settings);
    }
  }

  async addTaskToFavorites(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    await this.updateSettingsWithTask(settings, task.taskId, 'favoriteTaskIds');
  }

  async removeTaskFromFavorites(task: TaskoratorTask) {
    const settings = await this.getCurrentSettings();
    if (!settings) return;

    const index = settings.favoriteTaskIds.indexOf(task.taskId);
    if (index > -1) {
      settings.favoriteTaskIds.splice(index, 1);
      await this.settingsService.updateSettings(settings);
    }
  }
}
