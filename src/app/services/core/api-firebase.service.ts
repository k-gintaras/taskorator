import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { Score } from '../../models/score';
import {
  RegisterUserResult,
  TaskUserInfo,
} from '../../models/service-strategies/user';
import { TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { TaskApiService } from '../api/task-api.service';
import { TaskSettingsApiService } from '../api/task-settings-api.service';
import { TaskScoreApiService } from '../api/task-score-api.service';
import { TaskTreeApiService } from '../api/task-tree-api.service';
import { TaskListApiService } from '../api/task-list-api.service';
import { RegisterApiService } from '../api/register-api.service';
import { KeyApiService } from '../api/key-api.service';
import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root',
})
export class ApiFirebaseService implements ApiStrategy {
  constructor(
    private registerService: RegisterApiService,
    private apiKeyService: KeyApiService,
    private userService: UserApiService,
    private taskService: TaskApiService,
    private taskListService: TaskListApiService,
    private settingsService: TaskSettingsApiService,
    private scoreService: TaskScoreApiService,
    private treeService: TaskTreeApiService
  ) {}

  generateApiKey(userId: string): Promise<string | undefined> {
    return this.apiKeyService.generateApiKey(userId);
  }

  register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: TaskSettings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult> {
    return this.registerService.register(
      userId,
      initialTask,
      additionalTasks,
      settings,
      score,
      tree
    );
  }

  getUserInfo(userId: string): Promise<TaskUserInfo | undefined> {
    return this.userService.getUserInfo(userId);
  }

  createTask(userId: string, task: Task): Promise<Task | null> {
    // Generate a new unique task ID if not provided
    if (!task.taskId) {
      task.taskId = this.generateUniqueId();
    }
    return this.taskService.createTask(userId, task);
  }

  createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task | null> {
    task.taskId = taskId;
    return this.taskService.createTask(userId, task);
  }

  updateTask(userId: string, task: Task): Promise<boolean> {
    return this.taskService.updateTask(userId, task);
  }

  getTaskById(userId: string, taskId: string): Promise<Task | null> {
    return this.taskService.getTaskById(userId, taskId);
  }

  getLatestTaskId(userId: string): Promise<string | null> {
    return this.taskService.getLatestTaskId(userId);
  }

  getSuperOverlord(userId: string, taskId: string): Promise<Task | null> {
    return this.taskService.getSuperOverlord(userId, taskId);
  }

  getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | null> {
    return this.taskListService.getOverlordTasks(userId, overlordId);
  }

  getTasks(userId: string): Promise<Task[] | null> {
    return this.taskService.getTasks(userId);
  }

  createTasks(userId: string, tasks: Task[]): Promise<Task[] | null> {
    // Assign unique IDs to tasks without an ID
    const tasksWithIds = tasks.map((task) => ({
      ...task,
      id: task.taskId || this.generateUniqueId(),
    }));
    return this.taskService.createTasks(userId, tasksWithIds);
  }

  updateTasks(userId: string, tasks: Task[]): Promise<boolean> {
    return this.taskService.updateTasks(userId, tasks);
  }

  getTree(userId: string): Promise<TaskTree | null> {
    return this.treeService.getTree(userId);
  }

  updateTree(userId: string, taskTree: TaskTree): Promise<void> {
    return this.treeService.updateTree(userId, taskTree);
  }

  createTree(userId: string, taskTree: TaskTree): Promise<TaskTree | null> {
    return this.treeService.createTree(userId, taskTree);
  }

  getSettings(userId: string): Promise<TaskSettings | null> {
    return this.settingsService.getSettings(userId);
  }

  updateSettings(userId: string, settings: TaskSettings): Promise<void> {
    return this.settingsService.updateSettings(userId, settings);
  }

  createSettings(
    userId: string,
    settings: TaskSettings
  ): Promise<TaskSettings | null> {
    return this.settingsService.createSettings(userId, settings);
  }

  createScore(userId: string, score: Score): Promise<Score | null> {
    return this.scoreService.createScore(userId, score);
  }

  getScore(userId: string): Promise<Score | null> {
    return this.scoreService.getScore(userId);
  }

  updateScore(userId: string, score: Score): Promise<void> {
    return this.scoreService.updateScore(userId, score);
  }

  // Utility method to generate unique IDs
  private generateUniqueId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
