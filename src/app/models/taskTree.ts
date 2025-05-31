import { ROOT_TASK_ID, TaskStage } from './taskModelManager';
export interface TaskTreeNode {
  taskId: string; // Unique identifier for the task
  name: string; // Task name for quick identification
  overlord: string | null; // Parent task ID or null for root
  children: TaskTreeNode[]; // Array of child nodes
  childrenCount: number; // Total number of direct children
  completedChildrenCount: number; // Number of completed child tasks
  connected: boolean; // Indicates if the node is connected to the tree
  stage: TaskStage; // Task stage for more nuanced status tracking
}

export interface TaskTree {
  primarch: TaskTreeNode; // Main tree structure
  abyss: TaskTreeNode[]; // Disconnected tasks
  connected: boolean; // Indicates if the tree is fully connected
  totalTasks: number;
}

// Abstracted details about a single task node
export interface TaskNodeInfo {
  taskId: string; // Unique identifier for the task
  stage: TaskStage; // Current stage of the task
  overlord: string | null; // Parent task ID
  childrenCount: number; // Total number of direct children
  completedChildrenCount: number; // Number of completed children
  connected: boolean; // Indicates connection to the tree
}

export function getDefaultTree(): TaskTree {
  const primarch: TaskTreeNode = {
    taskId: ROOT_TASK_ID,
    name: 'Primarch Node',
    overlord: null,
    children: [],
    childrenCount: 0,
    completedChildrenCount: 0,
    connected: true,
    stage: 'todo', // Default stage for the root
  };

  return {
    primarch: primarch,
    abyss: [], // Start with no disconnected tasks
    connected: true, // Initially fully connected
    totalTasks: 1, // root is a task...
  };
}
