import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import ApiService from './api.service';
import {
  Task,
  getBaseTask,
  getDefaultTask,
} from 'src/app/models/taskModelManager';
import { getDefaultSettings } from 'src/app/models/settings';
import { getDefaultScore } from 'src/app/models/score';
import { TaskTree, getDefaultTree } from 'src/app/models/taskTree';
import { CacheService } from './cache.service';

/**
 * Registration additional service
 * @example
 * const r = inject(RegistrationService);
 * r.registerUser(user: UserCredential);
 *
 * @remarks
 * Sets up all the data associated with user when registering
 */
@Injectable({ providedIn: 'root' })
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

    const initialTask = await this.createInitialTask(userId);
    const additionalTasks = await this.createAdditionalTasks(
      userId,
      initialTask
    );
    const settings = await this.createSettings(userId, initialTask.taskId);
    const score = await this.createScore(userId);
    const tree = await this.createTree(userId, initialTask.taskId);

    await this.cacheService.createTask(initialTask);
    await Promise.all(
      additionalTasks.map((task) => this.cacheService.createTask(task))
    );
    await this.cacheService.createSettings(settings);
    await this.cacheService.createScore(score);
    await this.cacheService.createTree(tree);
  }

  private async createInitialTask(userId: string): Promise<Task> {
    const task = await this.apiService.createTaskWithCustomId(
      userId,
      getBaseTask(),
      '128'
    );

    if (!task) {
      throw new Error('Could not create initial task @createInitialTask()');
    }

    return task;
  }

  private async createAdditionalTasks(
    userId: string,
    parent: Task
  ): Promise<Task[]> {
    const additionalTasks: Task[] = [
      getDefaultTask(),
      getDefaultTask(),
      getDefaultTask(),
    ];

    additionalTasks[0].name = 'Complete first task';
    additionalTasks[1].name = 'Try creating task';
    additionalTasks[2].name = 'Try moving task into subtask';

    additionalTasks.forEach((t: Task) => {
      t.overlord = parent.taskId;
    });

    const createdTasks = await this.apiService.createTasks(
      userId,
      additionalTasks
    );

    if (createdTasks.length !== additionalTasks.length) {
      throw new Error(
        'Could not create all additional tasks @createAdditionalTasks()'
      );
    }

    return createdTasks;
  }

  private async createSettings(userId: string, initialTaskId: string) {
    const baseSettings = getDefaultSettings();
    baseSettings.lastOverlordViewId = initialTaskId;
    const settings = await this.apiService.createSettings(userId, baseSettings);

    if (!settings) {
      throw new Error('Could not create settings @createSettings()');
    }

    return settings;
  }

  private async createScore(userId: string) {
    const score = await this.apiService.createScore(userId, getDefaultScore());

    if (!score) {
      throw new Error('Could not create score @createScore()');
    }

    return score;
  }

  private async createTree(userId: string, initialTaskId: string) {
    const baseTree: TaskTree = getDefaultTree();
    baseTree.root.taskId = initialTaskId;
    const tree = await this.apiService.createTree(userId, getDefaultTree());

    if (!tree) {
      throw new Error('Could not create tree @createTree()');
    }

    return tree;
  }
}
