export interface TaskTree {
  root: TaskTreeNode;
}
export interface TaskTreeNode {
  name: string;
  isCompleted: boolean;
  taskId: string; // Assuming tasks are identified by string IDs, adjust as necessary
  overlord: string | null; // The ID of the parent task, or null for the root
  children: TaskTreeNode[]; // Array of child nodes
  childrenCount: number; // The total number of direct children of this node
  completedChildrenCount: number; // The number of completed tasks among the children
  // You can add more properties to TaskTreeNode as needed, e.g., task title, description, etc.
}

// just has no children nodes;
export interface TaskTreeNodeData {
  isCompleted: boolean;
  overlord: string | null; // The ID of the parent task, or null for the root
  childrenCount: number; // The total number of direct children of this node
  completedChildrenCount: number; // The number of completed tasks among the children
  // You can add more properties to TaskTreeNode as needed, e.g., task title, description, etc.
}

export function getDefaultTree(): TaskTree {
  const root: TaskTreeNode = {
    taskId: 'root', // Or a unique identifier if 'root' is too generic
    overlord: null,
    children: [],
    childrenCount: 0,
    completedChildrenCount: 0,
    name: 'Root Node',
    isCompleted: false,
  };
  return {
    root,
  };
}
