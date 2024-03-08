import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import { SettingsService } from './settings.service';
import { TaskService } from '../task/task.service';
import ApiService from './api.service';
import { ScoreService } from './score.service';
import { TreeService } from './tree.service';
import { Task, getBaseTask } from 'src/app/models/taskModelManager';
import { getDefaultSettings } from 'src/app/models/settings';
import { getDefaultScore } from 'src/app/models/score';
import { TaskTree, getDefaultTree } from 'src/app/models/taskTree';
import { CacheService } from './cache.service';

/**
 * registration additional service
 * @example
 * const r = inject(RegistrationService);
 * r.registerUser(user: UserCredential);
 *
 * @remarks
 * sets up all the data associated with user when registering
 */
@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService
  ) {}
  async registerUser(user: UserCredential) {
    const userId = user.user?.uid;
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }
    const task = await this.apiService.createTask(userId, getBaseTask());
    const baseSettings = getDefaultSettings();
    baseSettings.lastOverlordViewId = task.taskId;
    const settings = await this.apiService.createSettings(userId, baseSettings);
    const score = await this.apiService.createScore(userId, getDefaultScore());
    const baseTree: TaskTree = getDefaultTree();
    baseTree.root.taskId = task.taskId;
    const tree = await this.apiService.createTree(userId, getDefaultTree());

    if (!settings) {
      throw new Error('Could not create settings @registerUser()');
    }
    if (!score) {
      throw new Error('Could not create score @registerUser()');
    }
    if (!tree) {
      throw new Error('Could not create tree @registerUser()');
    }

    await this.cacheService.createTask(task);
    await this.cacheService.createSettings(settings);
    await this.cacheService.createScore(score);
    await this.cacheService.createTree(tree);
  }

  async createTask(userId: string, task: Task): Promise<Task> {
    return await this.apiService.createTask(userId, task);
  }
}
