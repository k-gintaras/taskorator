import { TaskTree } from 'src/app/models/taskTree';

export interface TreeStrategy {
  getTree(): Promise<TaskTree | null>;
  updateTree(taskTree: TaskTree): Promise<void>;
}
export interface TreeApiStrategy {
  getTree(userId: string): Promise<TaskTree | null>;
  updateTree(userId: string, taskTree: TaskTree): Promise<void>;
}
