import { Task } from '../taskModelManager';

export interface TaskManagementStrategy {
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<void>;
  getTaskById(taskId: string): Promise<Task | undefined>;
  getLatestTaskId(): Promise<string | undefined>;
  getSuperOverlord(taskId: string): Promise<Task | undefined>;
  getOverlordChildren(overlordId: string): Promise<Task[] | undefined>;
  getTasks(): Promise<Task[]>;
  createTasks(tasks: Task[]): Promise<Task[]>;
  updateTasks(tasks: Task[]): Promise<void>;
}

export interface TaskManagementApiStrategy {
  createTask(userId: string, task: Task): Promise<Task>;
  createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task>;
  updateTask(userId: string, task: Task): Promise<void>;
  getTaskById(userId: string, taskId: string): Promise<Task | undefined>;
  getLatestTaskId(userId: string): Promise<string | undefined>;
  getSuperOverlord(userId: string, taskId: string): Promise<Task | undefined>;
  getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | undefined>;
  getTasks(userId: string): Promise<Task[]>;
  createTasks(userId: string, tasks: Task[]): Promise<Task[]>; // because we create new ids
  updateTasks(userId: string, tasks: Task[]): Promise<void>;
}
