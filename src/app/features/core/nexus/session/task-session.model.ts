// models/task-session.model.ts
export interface TaskSession {
  id: string;
  name: string;
  taskIds: string[];
  duration: number; // Duration in seconds
}
