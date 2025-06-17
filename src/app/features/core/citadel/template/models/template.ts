import { TaskoratorTask } from '../../../../../models/taskModelManager';

export interface TaskTemplate {
  id: string; // Unique identifier for the template
  name: string; // Name of the template
  authorId: string; // User ID of the template creator
  authorName: string; // Name of the author, for easier display without additional queries
  isPublic: boolean; // True if the template is publicly available
  price?: number; // Optional price, relevant if the template is for sale
  tasks: TaskoratorTask[]; // Array of tasks associated with this template
}

export const getBaseTemplate = () => {
  const template: TaskTemplate = {
    id: '0',
    name: 'base',
    authorId: 'unknown',
    authorName: 'anonymous',
    isPublic: false,
    tasks: [],
  };
  return { ...template };
};
