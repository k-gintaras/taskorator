export interface Task {
  taskId: string; // Unique identifier for the task
  name: string;
  todo: string;
  why: string;
  timeCreated: number; // UNIX timestamp in milliseconds
  lastUpdated: number; // UNIX timestamp in milliseconds
  timeEnd: number | null; // UNIX timestamp in milliseconds
  duration: number; // Estimated time to complete the task in minutes or hours
  overlord: string | null; // taskId of the parent task if it's part of a hierarchy
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

/**
 * task type guesser:
 * if "Task name caps"- project
 * "task name" - todo
 * if TASK NAME -???
 */
export type TaskType =
  | ''
  | 'code'
  | 'idea'
  | 'note'
  | 'todo'
  | 'checklist'
  | 'tree' // decision tree
  | 'flowchart'
  | 'task'
  | 'next'
  | 'job'
  | 'feature'
  | 'schedule'
  | 'project'; // never ends, can be considered completed if all inside completed, buy maybe not
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

export const ROOT_TASK_ID = '128';
export const ROOT_TASK_DESCRIPTION = 'where everything connects';

export function getDefaultTask(): Task {
  const now = Date.now(); // Current time in milliseconds
  return {
    taskId: '0',
    name: '',
    todo: '',
    why: '',
    timeCreated: now,
    lastUpdated: now,
    timeEnd: null,
    duration: 0,
    overlord: ROOT_TASK_ID,
    repeat: 'once',
    status: 'active',
    stage: 'todo',
    type: 'todo',
    subtype: 'list',
    size: 'do now',
    owner: '',
    priority: 5,
    backupLink: '',
    imageUrl: '',
    imageDataUrl: '',
    tags: [],
  };
}

export function getBaseTask(): Task {
  const now = Date.now(); // Current time in milliseconds
  return {
    taskId: ROOT_TASK_ID,
    name: 'Me',
    todo: '',
    why: ROOT_TASK_DESCRIPTION,
    timeCreated: now,
    lastUpdated: now,
    timeEnd: null,
    duration: 0,
    overlord: null,
    repeat: 'once',
    status: 'active',
    stage: 'todo',
    type: 'todo',
    subtype: 'list',
    size: 'do now',
    owner: '',
    priority: 5,
    backupLink: '',
    imageUrl: '',
    imageDataUrl: '',
    tags: [],
  };
}

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
