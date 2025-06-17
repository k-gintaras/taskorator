import { TaskListKey } from '../task-list-model';
import { TaskoratorTask } from '../taskModelManager';
export interface TaskListApiStrategy {
  getLatestCreatedTasks(): Promise<TaskoratorTask[] | null>;
  getLatestUpdatedTasks(): Promise<TaskoratorTask[] | null>;
  getOverlordTasks(taskId: string): Promise<TaskoratorTask[] | null>; // same as overlord tasks but we move here for cleanliness
  getSessionTasks(sessionId: string): Promise<TaskoratorTask[] | null>; // same as overlord tasks but we move here for cleanliness
  getDailyTasks(): Promise<TaskoratorTask[] | null>;
  getWeeklyTasks(): Promise<TaskoratorTask[] | null>;
  getMonthlyTasks(): Promise<TaskoratorTask[] | null>;
  getYearlyTasks(): Promise<TaskoratorTask[] | null>;
  getFocusTasks(): Promise<TaskoratorTask[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getFavoriteTasks(): Promise<TaskoratorTask[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getFrogTasks(): Promise<TaskoratorTask[] | null>; // or getTasksFrom  Array(focusTasks:string[])... api allow access it maybe as we can read tree...
  getTasksToSplit(): Promise<TaskoratorTask[] | null>; // big tasks, tasks that are not deep in tree? figure it out... to make tasks more doable to make project progress
  getTasksToCrush(): Promise<TaskoratorTask[] | null>; // small tasks, tasks that are many in 1 parent use tree to find, to make lists and tasks more organized
  getTasksByType(taskListType: TaskListKey): Promise<TaskoratorTask[] | null>;
  getTasksFromIds(taskIds: string[]): Promise<TaskoratorTask[] | null>;
}
