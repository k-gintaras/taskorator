import { Task } from '../taskModelManager';

// settings or a limit?
// type TaskListType ... "daily"
// TaskListService will do this
// getTasks(taskListType:TaskListTypes):Task[]|null{}// switch?
// {cacheService.getTasks(taskListType:TaskListTypes)...
// apiService.getTasks(userId:string,taskListType:TaskListTypes)...}

export const TASK_LIST_LIMIT = 20;
export type TaskListType =
  | 'latest'
  | 'latestUpdated'
  | 'daily'
  | 'weekly'
  | 'focus'
  | 'split'
  | 'crush'; // and more...

export interface TaskListStrategy {
  getLatestTasks(): Promise<Task[] | null>;
  getLatestUpdatedTasks(): Promise<Task[] | null>;
  getOverlordTasks(taskId: string): Promise<Task[] | null>; // same as overlord tasks but we move here for cleanliness
  getDailyTasks(): Promise<Task[] | null>;
  getWeeklyTasks(): Promise<Task[] | null>;
  getFocusTasks(): Promise<Task[] | null>; // or getTasksFromArray(focusTasks:string[])... api allow access it maybe as we can read tree...
  getTasksToSplit(): Promise<Task[] | null>; // big tasks, tasks that are not deep in tree? figure it out... to make tasks more doable to make project progress
  getTasksToCrush(): Promise<Task[] | null>; // small tasks, tasks that are many in 1 parent use tree to find, to make lists and tasks more organized
  getTasks(taskListType: TaskListType): Promise<Task[] | null>;
  getTasksFromIds(taskIds: string[]): Promise<Task[] | null>;
}

export interface TaskListApiStrategy {
  getLatestUpdatedTasks(userId: string): Promise<Task[] | null>;
  getOverlordTasks(userId: string, taskId: string): Promise<Task[] | null>; // same as overlord tasks but we move here for cleanliness
  getDailyTasks(userId: string): Promise<Task[] | null>;
  getWeeklyTasks(userId: string): Promise<Task[] | null>;
  getFocusTasks(userId: string): Promise<Task[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getTasksToSplit(userId: string): Promise<Task[] | null>; // big tasks, tasks that are not deep in tree? figure it out... to make tasks more doable to make project progress
  getTasksToCrush(userId: string): Promise<Task[] | null>; // small tasks, tasks that are many in 1 parent use tree to find, to make lists and tasks more organized
  getTasks(userId: string, taskListType: TaskListType): Promise<Task[] | null>;
  getTasksFromIds(userId: string, taskIds: string[]): Promise<Task[] | null>;
}
