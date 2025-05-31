import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { Score } from '../../models/score';
import {
  RegisterUserResult,
  TaskUserInfo,
} from '../../models/service-strategies/user';
import { TaskSettings } from '../../models/settings';
import { getUniqueTaskId, Task } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { TaskListKey } from '../../models/task-list-model';
import { RegistrationData } from '../../models/service-strategies/registration-strategy';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';
import { AuthOfflineService } from './auth-offline.service';
import { OTHER_CONFIG } from '../../app.config';

const getUserStorageKeys = (userId: string) => ({
  TASKS: `tasks_${userId}`,
  SETTINGS: `settings_${userId}`,
  TREE: `tree_${userId}`,
  SCORE: `score_${userId}`,
  USER: `user_${userId}`,
});

@Injectable({
  providedIn: 'root',
})
export class ApiOfflineService implements ApiStrategy {
  constructor(
    private nodeTools: TaskTreeNodeToolsService,
    private auth: AuthOfflineService
  ) {}

  private getStorageItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setStorageItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // User methods
  async generateApiKey(): Promise<string | undefined> {
    return 'undefined';
  }

  async deleteUser(): Promise<void> {
    const storageKeys = this.getCurrentUserStorageKeys();
    if (!storageKeys) return;
    localStorage.removeItem(storageKeys['USER']);
  }

  async createUserInfo(userInfo: TaskUserInfo): Promise<void> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.USER, userInfo);
  }

  async updateUserInfo(userInfo: TaskUserInfo): Promise<void> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.USER, userInfo);
  }

  private getCurrentUserStorageKeys(): Record<string, string> | null {
    const currentUserId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    return currentUserId ? getUserStorageKeys(currentUserId) : null;
  }

  async register(
    registrationData: RegistrationData
  ): Promise<RegisterUserResult> {
    console.log('Registering offline...');

    try {
      // User ID generation (example, customize as needed)
      const userId =
        this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
      const storageKeys = getUserStorageKeys(userId);

      // Save user-specific settings
      this.setStorageItem(storageKeys.SETTINGS, registrationData.settings);

      // Save user-specific score
      this.setStorageItem(storageKeys.SCORE, registrationData.score);

      // Save user-specific tasks
      const tasks = [
        registrationData.initialTask,
        ...registrationData.additionalTasks,
      ];
      this.setStorageItem(storageKeys.TASKS, tasks);

      // Save user-specific task tree
      this.setStorageItem(storageKeys.TREE, registrationData.tree);

      // Save user profile
      const userInfo = {
        ...registrationData.userInfo,
        userId,
        registered: true,
      };
      this.setStorageItem(storageKeys.USER, userInfo);

      console.log(`Offline registration successful for user ${userId}.`);
      return {
        success: true,
        message: 'User registered successfully in offline mode.',
        userId: userId,
      };
    } catch (error) {
      console.error('Offline registration failed:', error);
      return {
        success: false,
        message: 'Offline registration failed.',
      };
    }
  }

  async getUserInfo(): Promise<TaskUserInfo | undefined> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    return this.getStorageItem(storageKeys.USER) || undefined;
  }

  // Tasks collection methods
  async getLatestCreatedTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.sort(
      (a, b) =>
        new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
    );
  }

  async getLatestUpdatedTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getDailyTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => task.repeat === 'daily');
  }

  async getWeeklyTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => task.repeat === 'weekly');
  }

  async getMonthlyTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => task.repeat === 'monthly');
  }

  async getYearlyTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => task.repeat === 'yearly');
  }

  async getFocusTasks(): Promise<Task[] | null> {
    const settings = await this.getSettings();
    if (!settings?.focusTaskIds?.length) return [];
    return this.getTasksFromIds(settings.focusTaskIds);
  }

  async getFavoriteTasks(): Promise<Task[] | null> {
    const settings = await this.getSettings();
    if (!settings?.favoriteTaskIds?.length) return [];
    return this.getTasksFromIds(settings.favoriteTaskIds);
  }

  async getFrogTasks(): Promise<Task[] | null> {
    const settings = await this.getSettings();
    if (!settings?.frogTaskIds?.length) return [];
    return this.getTasksFromIds(settings.frogTaskIds);
  }

  // Individual task methods
  async createTask(task: Task): Promise<Task | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    task.taskId = getUniqueTaskId();
    tasks.push(task);
    this.setStorageItem(storageKeys.TASKS, tasks);
    return task;
  }

  async updateTask(task: Task): Promise<boolean> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    const index = tasks.findIndex((t) => t.taskId === task.taskId);
    if (index !== -1) {
      tasks[index] = task;
      this.setStorageItem(storageKeys.TASKS, tasks);
      return true;
    }
    return false;
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.find((task) => task.taskId === taskId) || null;
  }

  // Settings methods
  async getSettings(): Promise<TaskSettings | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    return this.getStorageItem(storageKeys.SETTINGS);
  }

  async updateSettings(settings: TaskSettings): Promise<void> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.SETTINGS, settings);
  }

  async createSettings(settings: TaskSettings): Promise<TaskSettings | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.SETTINGS, settings);
    return settings;
  }

  // Score methods
  async createScore(score: Score): Promise<Score | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.SCORE, score);
    return score;
  }

  async getScore(): Promise<Score | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    return this.getStorageItem(storageKeys.SCORE);
  }

  async updateScore(score: Score): Promise<void> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.SCORE, score);
  }

  // Implementing remaining required methods with basic functionality
  async getOverlordTasks(taskId: string): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => task.overlord === taskId);
  }

  async getSessionTasks(sessionId: string): Promise<Task[] | null> {
    // const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    // return tasks.filter((task) => task.session === sessionId);
    throw new Error('get sessions not implemented in offline');
  }

  async getTasksToSplit(): Promise<Task[] | null> {
    const tree = await this.getTree();
    if (!tree) return [];

    const toSplit = await this.nodeTools.getTaskIdsToSplit(tree);
    const ids = toSplit?.map((n) => n.taskId);
    if (!ids) return null;
    return this.getTasksFromIds(ids);
  }

  async getTasksToCrush(): Promise<Task[] | null> {
    const tree = await this.getTree();
    if (!tree) return [];

    const toSplit = await this.nodeTools.getTaskIdsToCrush(tree);
    const ids = toSplit?.map((n) => n.taskId);
    if (!ids) return null;
    return this.getTasksFromIds(ids);
  }

  // Additional required methods with basic implementations
  async getTasksByType(taskListType: TaskListKey): Promise<Task[] | null> {
    // Implementation would depend on your TaskListKey enum
    return [];
  }

  async getTasksFromIds(taskIds: string[]): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    return tasks.filter((task) => taskIds.includes(task.taskId));
  }

  async createTaskWithCustomId(
    task: Task,
    taskId: string
  ): Promise<Task | null> {
    const taskWithCustomId = { ...task, id: taskId };
    return this.createTask(taskWithCustomId);
  }

  async getLatestTaskId(): Promise<string | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    const sortedTasks = tasks.sort(
      (a, b) =>
        new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
    );
    return sortedTasks[0]?.taskId || null;
  }

  async getSuperOverlord(taskId: string): Promise<Task | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const tasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task?.overlord) return null;
    return this.getTaskById(task.overlord);
  }

  async getOverlordChildren(overlordId: string): Promise<Task[] | null> {
    return this.getOverlordTasks(overlordId);
  }

  async getTasks(): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    return this.getStorageItem(storageKeys.TASKS);
  }

  async createTasks(tasks: Task[]): Promise<Task[] | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const existingTasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    const updatedTasks = [...existingTasks, ...tasks];
    for (const t of updatedTasks) {
      t.taskId = getUniqueTaskId();
    }
    this.setStorageItem(storageKeys.TASKS, updatedTasks);
    return tasks;
  }

  async updateTasks(tasks: Task[]): Promise<boolean> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    const existingTasks = this.getStorageItem<Task[]>(storageKeys.TASKS) || [];
    const updatedTasks = existingTasks.map((existingTask) => {
      const updatedTask = tasks.find((t) => t.taskId === existingTask.taskId);
      return updatedTask || existingTask;
    });
    this.setStorageItem(storageKeys.TASKS, updatedTasks);
    return true;
  }

  // Tree methods
  async getTree(): Promise<TaskTree | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    return this.getStorageItem(storageKeys.TREE);
  }

  async updateTree(taskTree: TaskTree): Promise<void> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.TREE, taskTree);
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    const userId =
      this.auth.getCurrentUserId() || OTHER_CONFIG.OFFLINE_USER_LOGIN_ID;
    const storageKeys = getUserStorageKeys(userId);
    this.setStorageItem(storageKeys.TREE, taskTree);
    return taskTree;
  }
}
