import { Observable } from 'rxjs';
import { TaskTree } from 'src/app/models/taskTree';

export interface TreeStrategy {
  createTree(taskTree: TaskTree): Promise<TaskTree | null>;
  getTree(): Observable<TaskTree | null>;
  updateTree(taskTree: TaskTree): Promise<void>;
}
export interface TreeCacheStrategy {
  createTree(taskTree: TaskTree): Promise<TaskTree | null>;
  getTree(): Promise<TaskTree | null>;
  updateTree(taskTree: TaskTree): Promise<void>;
}
export interface TreeApiStrategy {
  getTree(userId: string): Promise<TaskTree | null>;
  updateTree(userId: string, taskTree: TaskTree): Promise<void>;
  createTree(userId: string, taskTree: TaskTree): Promise<TaskTree | null>;
}
