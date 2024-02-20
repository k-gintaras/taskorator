import { Observable } from 'rxjs';
import { Task } from 'src/app/models/taskModelManager';

export interface TaskManagementStrategy {
  createTask(task: Task): Promise<Task>;
  updateTask(task: Task): Promise<void>;
  getTaskById(taskId: string): Observable<Task | undefined>;
  getLatestTaskId(): Observable<string>;
  getSuperOverlord(taskId: string): Observable<Task | undefined>;
  getOverlordChildren(taskId: string): Observable<Task[]>;
  getTasks(userId: string): Promise<Task[]>;
  createTasks(tasks: Task[]): Promise<void>;
  updateTasks(tasks: Task[]): Promise<void>;
}
