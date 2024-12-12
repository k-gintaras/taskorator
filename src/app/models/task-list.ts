import { ExtendedTask } from './taskModelManager';

export interface TaskList {
  id: string; // Unique identifier for the list
  title: string; // Display name of the list
  type?: string; // Optional type, e.g., 'daily', 'latest'
  parent?: string; // Optional parent ID, for hierarchical lists
  description?: string; // Optional description for the list
  tasks: string[]; // Array of task IDs
  rules?: ListRules; // Optional rules for this list
}

export interface ListRules {
  filter?: (task: ExtendedTask) => boolean; // A filter function for tasks
  sorter?: (a: ExtendedTask, b: ExtendedTask) => number; // A sort function
  permissions?: ListPermissions; // Permissions for actions
}

export interface ListPermissions {
  canAdd: boolean;
  canMove: boolean;
  canDelete: boolean;
  canComplete: boolean;
}
