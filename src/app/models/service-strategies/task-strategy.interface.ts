import { TaskoratorTask } from '../taskModelManager';

// export interface TaskManagementStrategy {
//   createTask(task: Task): Promise<Task>;
//   updateTask(task: Task): Promise<void>;
//   getTaskById(taskId: string): Promise<Task | undefined>;
//   getLatestTaskId(): Promise<string | undefined>;
//   getSuperOverlord(taskId: string): Promise<Task | undefined>;
//   getOverlordChildren(overlordId: string): Promise<Task[] | undefined>;
//   getTasks(): Promise<Task[]>;
//   createTasks(tasks: Task[]): Promise<Task[]>;
//   updateTasks(tasks: Task[]): Promise<void>;
// }

export interface TaskCacheStrategy {
  createTask(task: TaskoratorTask): void; // Add task to cache, no return needed
  updateTask(task: TaskoratorTask): void; // Update existing task, no confirmation needed
  getTaskById(
    taskId: string
  ): TaskoratorTask | null | Promise<TaskoratorTask | null>; // Fetch task, can be sync or async
  clearCache(): void | Promise<void>; // Optional: Clear the cache, sync or async
}

export interface TaskApiStrategy {
  createTask(task: TaskoratorTask): Promise<TaskoratorTask | null>;
  createTaskWithCustomId(
    task: TaskoratorTask,
    taskId: string
  ): Promise<TaskoratorTask | null>;
  updateTask(task: TaskoratorTask): Promise<boolean>;
  getTaskById(taskId: string): Promise<TaskoratorTask | null>;
  getLatestTaskId(): Promise<string | null>;
  getSuperOverlord(taskId: string): Promise<TaskoratorTask | null>;
  // getOverlordChildren(overlordId: string): Promise<Task[] | null>; //  TASK LIST API... not TASK API, as this is a list...
  // getTasks(): Promise<Task[] | null>; //  TASK LIST API... not TASK API, as this is a list...
  createTasks(tasks: TaskoratorTask[]): Promise<TaskoratorTask[] | null>; // should be in task batch but its ok...
  updateTasks(tasks: TaskoratorTask[]): Promise<boolean>; // should be in task batch but its ok...
}
