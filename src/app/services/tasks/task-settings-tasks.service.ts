import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from '../sync-api-cache/settings.service';
import { TaskSettings } from '../../models/settings';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import {
  TaskListKey,
  TaskListType,
  TaskListSubtype,
} from '../../models/task-list-model';
import { getIdFromKey } from '../../models/task-list-model';
/**
 * @fix or @deprecated use ExtendedTask for ui... or extend task to have "selected" property
 */
@Injectable({
  providedIn: 'root',
})
export class TaskSettingsTasksService {
  constructor(
    private settingsService: SettingsService,
    private taskIdCache: TaskIdCacheService
  ) {}

  private async getCurrentSettings(): Promise<TaskSettings | null> {
    try {
      const settings = await firstValueFrom(this.settingsService.getSettings());
      return settings;
    } catch (err) {
      return null;
    }
  }

  private async updateSettingsWithTask(settings: TaskSettings, taskId: string, arrayName: keyof TaskSettings): Promise<void> {
    const array = settings[arrayName] as string[];
    if (!array.includes(taskId)) {
      array.push(taskId);
      await this.settingsService.updateSettings(settings);
      // Also update cache group so lists reflect change immediately
      const key: TaskListKey | null =
        arrayName === 'focusTaskIds'
          ? { type: TaskListType.FOCUS, data: TaskListSubtype.SETTINGS }
          : arrayName === 'frogTaskIds'
          ? { type: TaskListType.FROG, data: TaskListSubtype.SETTINGS }
          : arrayName === 'favoriteTaskIds'
          ? { type: TaskListType.FAVORITE, data: TaskListSubtype.SETTINGS }
          : null;
      if (key) {
        const groupName = getIdFromKey(key);
        this.taskIdCache.addTaskToGroup(groupName, taskId);
      }
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
      const taskListKey: TaskListKey = {
        type: TaskListType.FOCUS,
        data: TaskListSubtype.SETTINGS,
      };
      const groupName = getIdFromKey(taskListKey);
      this.taskIdCache.removeTaskFromGroup(groupName, task.taskId);
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
      const taskListKey: TaskListKey = {
        type: TaskListType.FROG,
        data: TaskListSubtype.SETTINGS,
      };
      const groupName = getIdFromKey(taskListKey);
      this.taskIdCache.removeTaskFromGroup(groupName, task.taskId);
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
      const taskListKey: TaskListKey = {
        type: TaskListType.FAVORITE,
        data: TaskListSubtype.SETTINGS,
      };
      const groupName = getIdFromKey(taskListKey);
      this.taskIdCache.removeTaskFromGroup(groupName, task.taskId);
    }
  }
}
