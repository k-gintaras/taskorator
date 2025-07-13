import { Injectable } from '@angular/core';
import { CacheStrategy } from '../../models/service-strategies/cache-strategy.interface';
import { Score } from '../../models/score';
import { TaskSettings } from '../../models/settings';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { TaskCacheService } from '../cache/task-cache.service';
import { TaskIdCacheService } from '../cache/task-id-cache.service';
import { SettingsCacheService } from '../cache/settings-cache.service';
import { ScoreCacheService } from '../cache/score-cache.service';
import { TreeCacheService } from '../cache/tree-cache.service';
import { TaskTransmutationService } from '../tasks/task-transmutation.service';

@Injectable({
  providedIn: 'root',
})
export class CacheOrchestratorService implements CacheStrategy {
  constructor(
    private taskCache: TaskCacheService,
    private taskIdCache: TaskIdCacheService,
    private settingsCache: SettingsCacheService,
    private scoreCache: ScoreCacheService,
    private treeCache: TreeCacheService,
    private transmuterService: TaskTransmutationService
  ) {}

  getTaskById(taskId: string): TaskoratorTask | null {
    return this.taskCache.getTask(taskId);
  }

  createTask(task: TaskoratorTask): void {
    const extendedTask = this.transmuterService.toUiTask(task);
    this.taskCache.addTask(extendedTask);

    // Update the latest task ID cache
    // if (task.taskId) {
    //   this.taskIdCache.setLatestTaskId(task.taskId);
    // }
  }

  updateTask(task: TaskoratorTask): void {
    const extendedTask = this.transmuterService.toUiTask(task);
    this.taskCache.addTask(extendedTask);
  }

  getTasks(): TaskoratorTask[] | null {
    return null;
  }

  createTree(taskTree: TaskTree): void {
    return this.treeCache.createTree(taskTree);
  }

  getTree(): TaskTree | null {
    return this.treeCache.getTree();
  }

  updateTree(taskTree: TaskTree): void {
    return this.treeCache.updateTree(taskTree);
  }

  createSettings(settings: TaskSettings): void {
    return this.settingsCache.createSettings(settings);
  }

  getSettings(): TaskSettings | null {
    return this.settingsCache.getSettings();
  }

  updateSettings(settings: TaskSettings): void {
    return this.settingsCache.updateSettings(settings);
  }

  createScore(score: Score): void {
    return this.scoreCache.createScore(score);
  }

  getScore(): Score | null {
    return this.scoreCache.getScore();
  }

  updateScore(score: Score): void {
    return this.scoreCache.updateScore(score);
  }

  clearCache(): void {
    this.taskCache.clearCache();
    this.taskIdCache.clearCache();
    this.settingsCache.clearCache();
    this.scoreCache.clearCache();
    this.treeCache.clearCache();
  }
}
