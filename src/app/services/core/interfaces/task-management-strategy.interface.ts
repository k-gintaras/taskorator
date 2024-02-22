import { Observable } from 'rxjs';
import { Task } from 'src/app/models/taskModelManager';

export interface TaskManagementStrategy {
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<void>;
  getTaskById(taskId: string): Observable<Task | undefined>;
  getLatestTaskId(): Observable<string | undefined>;
  getSuperOverlord(taskId: string): Observable<Task | undefined>;
  getOverlordChildren(overlordId: string): Observable<Task[] | undefined>;
  getTasks(): Promise<Task[]>;
  createTasks(tasks: Task[]): Promise<Task[]>;
  updateTasks(tasks: Task[]): Promise<void>;
}

export interface TaskManagementApiStrategy {
  createTask(userId: string, task: Task): Promise<Task>;
  updateTask(userId: string, task: Task): Promise<void>;
  getTaskById(userId: string, taskId: string): Observable<Task | undefined>;
  getLatestTaskId(userId: string): Observable<string | undefined>;
  getSuperOverlord(
    userId: string,
    taskId: string
  ): Observable<Task | undefined>;
  getOverlordChildren(
    userId: string,
    overlordId: string
  ): Observable<Task[] | undefined>;
  getTasks(userId: string): Promise<Task[]>;
  createTasks(userId: string, tasks: Task[]): Promise<Task[]>; // because we create new ids
  updateTasks(userId: string, tasks: Task[]): Promise<void>;
}
