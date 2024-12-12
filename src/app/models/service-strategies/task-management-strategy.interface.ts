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

export interface TaskManagementCacheStrategy {
  createTask(task: Task): void; // Add task to cache, no return needed
  updateTask(task: Task): void; // Update existing task, no confirmation needed
  getTaskById(taskId: string): Task | null | Promise<Task | null>; // Fetch task, can be sync or async
  getTasks(): Task[] | null | Promise<Task[]>; // Fetch all tasks, sync or async
  clearCache(): void | Promise<void>; // Optional: Clear the cache, sync or async
}

export interface TaskManagementApiStrategy {
  createTask(userId: string, task: Task): Promise<Task | null>;
  createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task | null>;
  updateTask(userId: string, task: Task): Promise<boolean>;
  getTaskById(userId: string, taskId: string): Promise<Task | null>;
  getLatestTaskId(userId: string): Promise<string | null>;
  getSuperOverlord(userId: string, taskId: string): Promise<Task | null>;
  getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | null>;
  getTasks(userId: string): Promise<Task[] | null>;
  createTasks(userId: string, tasks: Task[]): Promise<Task[] | null>; // because we create new ids
  updateTasks(userId: string, tasks: Task[]): Promise<boolean>;
}
