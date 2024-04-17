import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Score, getDefaultScore } from 'src/app/models/score';
import { Settings, getDefaultSettings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
import { TaskTree, getDefaultTree } from 'src/app/models/taskTree';
import { ApiStrategy } from '../core/interfaces/api-strategy.interface';
import { RegisterUserResult } from '../core/interfaces/register-user';

@Injectable({
  providedIn: 'root',
})
export class TestApiService implements ApiStrategy {
  private tasks: Task[] = [];
  // private taskTree: TaskTree | null = null;
  // private settings: Settings | null = null;
  // private score: Score | null = null;

  async register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: Settings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult> {
    this.tasks = [];
    console.log('additionalTasks--------------------');
    console.log(additionalTasks);

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
    console.log('API TASKS');
    console.log(this.tasks);
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

  async updateTask(userId: string, task: Task): Promise<void> {
    const index = this.tasks.findIndex((t) => t.taskId === task.taskId);
    if (index !== -1) {
      this.tasks[index] = task;
    }
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.taskId === taskId);
    return task;
  }

  async getLatestTaskId(userId: string): Promise<string | undefined> {
    const latestTask = this.tasks[this.tasks.length - 1];
    return latestTask?.taskId;
  }

  async getSuperOverlord(
    userId: string,
    taskId: string
  ): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (task && task.overlord) {
      const superOverlord = this.tasks.find((t) => t.taskId === task.overlord);
      return superOverlord;
    }
    return undefined;
  }

  async getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | undefined> {
    const children = this.tasks.filter((t) => t.overlord === overlordId);

    console.log('children GGGGGGGGGGGGGGGGGGGGG');
    console.log(children);
    return children;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return this.tasks;
  }

  async createTasks(userId: string, tasks: Task[]): Promise<Task[]> {
    console.log('createdTasks ');
    console.log('additionalTasks 222');
    console.log(tasks);
    const newTasks = tasks.map((task) => ({
      ...task,
      taskId: this.generateTaskId(),
    }));
    this.tasks.push(...newTasks);
    return newTasks;
  }

  async updateTasks(userId: string, tasks: Task[]): Promise<void> {
    tasks.forEach((task) => {
      const index = this.tasks.findIndex((t) => t.taskId === task.taskId);
      if (index !== -1) {
        this.tasks[index] = task;
      }
    });
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
    settings: Settings
  ): Promise<Settings | null> {
    // this.settings = settings;
    return settings;
  }

  async getSettings(userId: string): Promise<Settings | null> {
    return getDefaultSettings();
  }

  async updateSettings(userId: string, settings: Settings): Promise<void> {
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
