import { TaskTree } from 'src/task-tree';

export interface TreeStrategy {
  createTree(settings: TaskTree): Promise<TaskTree>;
  getTree(): Promise<TaskTree>;
  updateTree(settings: TaskTree): Promise<void>;
}
