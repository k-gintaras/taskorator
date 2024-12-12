import { Observable } from 'rxjs';
import { TaskTree } from '../taskTree';

export interface TreeStrategy {
  createTree(taskTree: TaskTree): Promise<TaskTree | null>;
  getTree(): Observable<TaskTree | null>;
  updateTree(taskTree: TaskTree): Promise<void>;
}
export interface TreeCacheStrategy {
  createTree(taskTree: TaskTree): void;
  getTree(): Promise<TaskTree | null> | TaskTree | null;
  updateTree(taskTree: TaskTree): void;
}
export interface TreeApiStrategy {
  getTree(userId: string): Promise<TaskTree | null>;
  updateTree(userId: string, taskTree: TaskTree): Promise<void>;
  createTree(userId: string, taskTree: TaskTree): Promise<TaskTree | null>;
}
