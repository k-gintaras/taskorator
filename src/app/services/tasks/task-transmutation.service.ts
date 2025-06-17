import { Injectable } from '@angular/core';
import { TaskoratorTask, ExtendedTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskTransmutationService {
  constructor() {}

  /**
   * Convert a `Task` to an `ExtendedTask`.
   * Adds default properties for visibility and animation state.
   */
  toExtendedTask(task: TaskoratorTask): ExtendedTask {
    return {
      ...task,
      isVisible: true, // Default visibility
      animationState: 'normal', // Default animation state
    };
  }

  /**
   * Convert an array of `Task` to an array of `ExtendedTask`.
   */
  toExtendedTasks(tasks: TaskoratorTask[]): ExtendedTask[] {
    return tasks.map((task) => this.toExtendedTask(task));
  }

  /**
   * Convert an `ExtendedTask` to a `Task`.
   * Strips out additional properties like visibility and animation state.
   */
  toTask(extendedTask: ExtendedTask): TaskoratorTask {
    const { isVisible, animationState, ...task } = extendedTask; // Remove extra properties
    return task;
  }

  /**
   * Convert an array of `ExtendedTask` to an array of `Task`.
   */
  toTasks(extendedTasks: ExtendedTask[]): TaskoratorTask[] {
    return extendedTasks.map((extendedTask) => this.toTask(extendedTask));
  }

  /**
   * Extract the `taskId` from an array of `ExtendedTask`.
   */
  getIds(tasks: ExtendedTask[]): string[] {
    return tasks.map((task) => task.taskId);
  }
}
