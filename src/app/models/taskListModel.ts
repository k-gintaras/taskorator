import { Task } from './taskModelManager';

export interface TaskList {
  title: string;
  tasks: Task[];
  actionName: string; // popup split and qq...
  onButtonClick: Function;
  onTaskSelected: Function;
}
