import { TaskListKey } from '../task-list-model';
import { Task } from '../taskModelManager';
export interface TaskListApiStrategy {
  getLatestCreatedTasks(): Promise<Task[] | null>;
  getLatestUpdatedTasks(): Promise<Task[] | null>;
  getOverlordTasks(taskId: string): Promise<Task[] | null>; // same as overlord tasks but we move here for cleanliness
  getSessionTasks(sessionId: string): Promise<Task[] | null>; // same as overlord tasks but we move here for cleanliness
  getDailyTasks(): Promise<Task[] | null>;
  getWeeklyTasks(): Promise<Task[] | null>;
  getMonthlyTasks(): Promise<Task[] | null>;
  getYearlyTasks(): Promise<Task[] | null>;
  getFocusTasks(): Promise<Task[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getFavoriteTasks(): Promise<Task[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getFrogTasks(): Promise<Task[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getTasksToSplit(): Promise<Task[] | null>; // big tasks, tasks that are not deep in tree? figure it out... to make tasks more doable to make project progress
  getTasksToCrush(): Promise<Task[] | null>; // small tasks, tasks that are many in 1 parent use tree to find, to make lists and tasks more organized
  getTasksByType(taskListType: TaskListKey): Promise<Task[] | null>;
  getTasksFromIds(taskIds: string[]): Promise<Task[] | null>;
}
