import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { Score } from '../../models/score';
import {
  RegisterUserResult,
  TaskUserInfo,
} from '../../models/service-strategies/user';
import { TaskSettings } from '../../models/settings';
import { getUniqueTaskId, TaskoratorTask } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { TaskApiService } from '../api/task-api.service';
import { TaskSettingsApiService } from '../api/task-settings-api.service';
import { TaskScoreApiService } from '../api/task-score-api.service';
import { TaskTreeApiService } from '../api/task-tree-api.service';
import { TaskListApiService } from '../api/task-list-api.service';
import { RegisterApiService } from '../api/register-api.service';
import { KeyApiService } from '../api/key-api.service';
import { UserApiService } from '../api/user-api.service';
import { TaskListKey } from '../../models/task-list-model';
import { RegistrationData } from '../../models/service-strategies/registration-strategy';

@Injectable({
  providedIn: 'root',
})
export class ApiFirebaseService implements ApiStrategy {
  constructor(
    private registerService: RegisterApiService,
    private taskService: TaskApiService,
    private taskListService: TaskListApiService,
    private settingsService: TaskSettingsApiService,
    private scoreService: TaskScoreApiService,
    private treeService: TaskTreeApiService
  ) {}

  generateApiKey(): void {
    this.registerService.generateApiKey();
  }

  createUserInfo(userInfo: TaskUserInfo): Promise<void> {
    return this.registerService.createUserInfo(userInfo);
  }

  updateUserInfo(userInfo: TaskUserInfo): Promise<void> {
    return this.registerService.updateUserInfo(userInfo);
  }

  register(registrationData: RegistrationData): Promise<RegisterUserResult> {
    return this.registerService.register(registrationData);
  }

  getUserInfo(): Promise<TaskUserInfo | undefined> {
    return this.registerService.getUserInfo();
  }

  deleteUser(): Promise<void> {
    return this.registerService.deleteCurrentUser();
  }

  getLatestCreatedTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getLatestCreatedTasks();
  }

  getLatestUpdatedTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getLatestUpdatedTasks();
  }

  getOverlordTasks(taskId: string): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getOverlordTasks(taskId);
  }

  getSessionTasks(sessionId: string): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getSessionTasks(sessionId);
  }

  getDailyTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getDailyTasks();
  }

  getWeeklyTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getWeeklyTasks();
  }

  getMonthlyTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getMonthlyTasks();
  }

  getYearlyTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getYearlyTasks();
  }

  getFocusTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getFocusTasks();
  }

  getFavoriteTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getFavoriteTasks();
  }

  getFrogTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getFrogTasks();
  }

  getTasksToSplit(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getTasksToSplit();
  }

  getTasksToCrush(): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getTasksToCrush();
  }

  getTasksByType(taskListType: TaskListKey): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getTasksByType(taskListType);
  }

  getTasksFromIds(taskIds: string[]): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getTasksFromIds(taskIds);
  }

  createTask(task: TaskoratorTask): Promise<TaskoratorTask | null> {
    // Generate a new unique task ID if not provided
    if (!task.taskId) {
      task.taskId = getUniqueTaskId();
    }
    return this.taskService.createTask(task);
  }

  createTaskWithCustomId(
    task: TaskoratorTask,
    taskId: string
  ): Promise<TaskoratorTask | null> {
    task.taskId = taskId;
    return this.taskService.createTask(task);
  }

  updateTask(task: TaskoratorTask): Promise<boolean> {
    return this.taskService.updateTask(task);
  }

  getTaskById(taskId: string): Promise<TaskoratorTask | null> {
    return this.taskService.getTaskById(taskId);
  }

  getLatestTaskId(): Promise<string | null> {
    return this.taskService.getLatestTaskId();
  }

  getSuperOverlord(taskId: string): Promise<TaskoratorTask | null> {
    return this.taskService.getSuperOverlord(taskId);
  }

  getOverlordChildren(overlordId: string): Promise<TaskoratorTask[] | null> {
    return this.taskListService.getOverlordTasks(overlordId);
  }

  getTasks(): Promise<TaskoratorTask[] | null> {
    return this.taskService.getTasks();
  }

  createTasks(tasks: TaskoratorTask[]): Promise<TaskoratorTask[] | null> {
    // Assign unique IDs to tasks without an ID
    const tasksWithIds = tasks.map((task) => ({
      ...task,
      id: task.taskId || getUniqueTaskId(),
    }));
    return this.taskService.createTasks(tasksWithIds);
  }

  updateTasks(tasks: TaskoratorTask[]): Promise<boolean> {
    return this.taskService.updateTasks(tasks);
  }

  getTree(): Promise<TaskTree | null> {
    return this.treeService.getTree();
  }

  updateTree(taskTree: TaskTree): Promise<void> {
    return this.treeService.updateTree(taskTree);
  }

  createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    return this.treeService.createTree(taskTree);
  }

  getSettings(): Promise<TaskSettings | null> {
    return this.settingsService.getSettings();
  }

  updateSettings(settings: TaskSettings): Promise<void> {
    return this.settingsService.updateSettings(settings);
  }

  createSettings(settings: TaskSettings): Promise<TaskSettings | null> {
    return this.settingsService.createSettings(settings);
  }

  createScore(score: Score): Promise<Score | null> {
    return this.scoreService.createScore(score);
  }

  getScore(): Promise<Score | null> {
    return this.scoreService.getScore();
  }

  updateScore(score: Score): Promise<void> {
    return this.scoreService.updateScore(score);
  }
}
