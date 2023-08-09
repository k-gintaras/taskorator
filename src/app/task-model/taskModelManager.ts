export interface Task {
  taskId: number; // Unique identifier for the task
  name: string;
  todo: string;
  why: string;
  timeCreated: Date; // Creation time of the task (JavaScript Date object)
  lastUpdated: Date | null;
  timeEnd: Date | null; // Completion time of the task (JavaScript Date object or null if not completed)
  duration: number; // Estimated time to complete the task in minutes or hours
  overlord: number | null | string; // taskId of the parent task if it's part of a hierarchy
  repeat: RepeatOptions;
  status: TaskStatus; // Task status options
  stage: TaskStage; // Task stage options
  type: TaskType;
  subtype: TaskSubtype;
  size: TaskSize; // we can delegate this to another owner or something
  owner: string; // for future use of who does whose tasks
  priority: number; // Task priority (1 to 10, for example)
  backupLink: string; // github, file location, web link, nothing
  imageUrl: string | null; // URL to the image file
  imageDataUrl: string | null; // Base64 representation of the image
  tags: string[]; // Array of tags associated with the task
}

export const maxPriority = 10;

export const taskTableName = 'tasks_table';
export const sqlCreateTable = `CREATE TABLE ${taskTableName} (
  taskId INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  todo TEXT NOT NULL,
  why TEXT NOT NULL,
  timeCreated TIMESTAMP NOT NULL,
  timeEnd TIMESTAMP,
  lastUpdated TIMESTAMP,
  duration INTEGER NOT NULL,
  overlord INTEGER,
  repeat TEXT NOT NULL,
  status TEXT NOT NULL,
  stage TEXT NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT NOT NULL,
  size TEXT NOT NULL,
  owner TEXT NOT NULL,
  priority INTEGER NOT NULL,
  backupLink TEXT NOT NULL,
  imageUrl TEXT,
  imageDataUrl TEXT,
  tags TEXT NOT NULL
);
`;

export type TaskSize = 'do now' | 'split' | 'delegate';
export type TaskStage = 'seen' | 'completed' | 'todo' | 'archived' | 'deleted';
export type TaskStatus = 'active' | 'inactive';
export type RepeatOptions =
  | 'once'
  | 'never'
  | 'half-hourly'
  | 'hourly'
  | 'half-daily'
  | 'daily'
  | 'weekly'
  | 'half-monthly'
  | 'monthly'
  | 'three-monthly'
  | 'half-yearly'
  | 'yearly';
export type TaskType =
  | ''
  | 'code'
  | 'idea'
  | 'note'
  | 'todo'
  | 'task'
  | 'schedule'
  | 'project';
export type TaskSubtype =
  | ''
  | 'js'
  | 'ts'
  | 'html'
  | 'css'
  | 'sound'
  | 'android'
  | 'angular'
  | 'nodejs'
  | 'java'
  | 'text'
  | 'list';

export function getDefaultTask(): Task {
  const defaultTask: Task = {
    taskId: 0,
    name: '',
    todo: '',
    why: '',
    timeCreated: new Date(), // Current date and time
    lastUpdated: new Date(), // Current date and time
    timeEnd: null,
    duration: 0,
    overlord: null,
    repeat: 'daily',
    status: 'active',
    stage: 'todo',
    type: 'todo',
    subtype: 'list',
    size: 'do now',
    owner: '',
    priority: 1,
    backupLink: '',
    imageUrl: '',
    imageDataUrl: '',
    tags: [],
  };

  return defaultTask;
}
