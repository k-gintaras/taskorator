import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import {
  RegisterUserResult,
  TaskUserInfo,
} from '../../models/service-strategies/user';
import { Score, getDefaultScore } from '../../models/score';
import { getDefaultTaskSettings, TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
import { TaskTree, getDefaultTree } from '../../models/taskTree';

@Injectable({
  providedIn: 'root',
})
export class TestApiService implements ApiStrategy {
  generateApiKey(userId: string): Promise<string | undefined> {
    throw new Error('Method not implemented.');
  }
  getUserInfo(userId: string): Promise<TaskUserInfo | undefined> {
    throw new Error('Method not implemented.');
  }

  private tasks: Task[] = [];
  // private taskTree: TaskTree | null = null;
  // private settings: Settings | null = null;
  // private score: Score | null = null;

  async register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: TaskSettings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult> {
    this.tasks = [];
    // Create the initial task with the provided taskId
    await this.createTaskWithCustomId(userId, initialTask, initialTask.taskId);

    // Create additional tasks with unique IDs
    const createdTasks = await this.createTasks(userId, additionalTasks);

    await this.createSettings(userId, settings);
    await this.createScore(userId, score);
    await this.createTree(userId, tree);

    const result: RegisterUserResult = {
      success: true,
      message: '',
    };
    return result;
  }

  async createTask(userId: string, task: Task): Promise<Task> {
    const newTask = {
      ...task,
      taskId: task.taskId !== '0' ? task.taskId : this.generateTaskId(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // clearCache() {
  //   this.tasks = [];
  //   this.taskTree = null;
  //   this.settings = null;
  //   this.score = null;
  // }

  async createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task> {
    console.log('test api service create task with custom id');
    const newTask = { ...task, taskId: taskId };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(userId: string, task: Task): Promise<boolean> {
    const index = this.tasks.findIndex((t) => t.taskId === task.taskId);
    if (index !== -1) {
      this.tasks[index] = task;
    }
    return true;
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    const task = this.tasks.find((t) => t.taskId === taskId);
    return task || null;
  }

  async getLatestTaskId(userId: string): Promise<string | null> {
    const latestTask = this.tasks[this.tasks.length - 1];
    return latestTask?.taskId;
  }

  async getSuperOverlord(userId: string, taskId: string): Promise<Task | null> {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (task && task.overlord) {
      const superOverlord = this.tasks.find((t) => t.taskId === task.overlord);
      return superOverlord || null;
    }
    return null;
  }

  async getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | null> {
    const children = this.tasks.filter((t) => t.overlord === overlordId);
    return children;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return this.tasks;
  }

  async createTasks(userId: string, tasks: Task[]): Promise<Task[]> {
    // console.log('createdTasks ');
    // console.log('additionalTasks 222');
    // console.log(tasks);
    // const newTasks = tasks.map((task) => ({
    //   ...task,
    //   taskId: this.generateTaskId(),
    // }));
    // this.tasks.push(...newTasks);
    tasks.forEach((task) => {
      this.createTask(userId, task);
    });
    return this.tasks;
  }

  async updateTasks(userId: string, tasks: Task[]): Promise<boolean> {
    tasks.forEach((task) => {
      const index = this.tasks.findIndex((t) => t.taskId === task.taskId);
      if (index !== -1) {
        this.tasks[index] = task;
      }
    });
    return true;
  }

  async createTree(
    userId: string,
    taskTree: TaskTree
  ): Promise<TaskTree | null> {
    // this.taskTree = taskTree;
    return taskTree;
  }

  async getTree(userId: string): Promise<TaskTree | null> {
    return getDefaultTree();
  }

  async updateTree(userId: string, taskTree: TaskTree): Promise<void> {
    // this.taskTree = taskTree;
  }

  async createSettings(
    userId: string,
    settings: TaskSettings
  ): Promise<TaskSettings | null> {
    // this.settings = settings;
    return settings;
  }

  async getSettings(userId: string): Promise<TaskSettings | null> {
    return getDefaultTaskSettings();
  }

  async updateSettings(userId: string, settings: TaskSettings): Promise<void> {
    // this.settings = settings;
  }

  async createScore(userId: string, score: Score): Promise<Score | null> {
    // this.score = score;
    return score;
  }

  async getScore(userId: string): Promise<Score | null> {
    return getDefaultScore();
  }

  async updateScore(userId: string, score: Score): Promise<void> {
    // this.score = score;
  }

  private generateTaskId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
