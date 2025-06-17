import { TaskoratorTask } from '../../models/taskModelManager';
import { data as jsonData } from './tasks-json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertToTaskArray = (jsonData: any[]): TaskoratorTask[] =>
  jsonData.map((item) => ({
    ...item,
    timeCreated: item.timeCreated ? new Date(item.timeCreated) : null,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : null,
    timeEnd: item.timeEnd ? new Date(item.timeEnd) : null,
    duration: parseInt(item.duration),
    tags: item.tags.split(/\s*,\s*/),
  }));

export const testTasks: TaskoratorTask[] = convertToTaskArray(jsonData);
