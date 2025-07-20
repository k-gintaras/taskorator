import { Injectable } from '@angular/core';
import { TaskoratorTask, UiTask } from '../../models/taskModelManager';
import { TaskNodeInfo } from '../../models/taskTree';

@Injectable({
  providedIn: 'root',
})
export class TaskTransmutationService {
  constructor() {}

  /**
   * Convert a `Task` to an `ExtendedTask`.
   * Adds default properties for visibility and animation state.
   */
  toUiTask(task: TaskoratorTask): UiTask {
    return {
      ...task,
      isConnectedToTree: true, // Default value, can be updated based on tree connection
      isSelected: false,
      isRecentlyViewed: false,
      completionPercent: 0,
      color: '#ccc', // Default color, can be updated based on age
      views: 0,
      isRecentlyUpdated: false,
      isRecentlyCreated: false,
      children: 0,
      completedChildren: 0,
      secondaryColor: '#ccc', // Default secondary color
      magnitude: 0, // Default size, can be updated based on task properties
    };
  }

  /**
   * Convert an array of `Task` to an array of `ExtendedTask`.
   */
  toUiTasks(tasks: TaskoratorTask[]): UiTask[] {
    return tasks.map((task) => this.toUiTask(task));
  }

  /**
   * Convert an `ExtendedTask` to a `Task`.
   * Strips out additional properties like visibility and animation state.
   */
  toTask(extendedTask: UiTask): TaskoratorTask {
    const { ...task } = extendedTask; // Remove extra properties
    return task;
  }

  /**
   * Convert an `ExtendedTask` to a `TaskNodeInfo`.
   * Strips out additional properties like visibility and animation state.
   */
  toTaskNodeInfo(extendedTask: UiTask): TaskNodeInfo {
    const task: TaskNodeInfo = {
      taskId: extendedTask.taskId,
      stage: extendedTask.stage,
      overlord: extendedTask.overlord,
      childrenCount: extendedTask.children,
      completedChildrenCount: extendedTask.completedChildren,
      connected: extendedTask.isConnectedToTree,
    };
    return task;
  }

  /**
   * Convert an array of `ExtendedTask` to an array of `Task`.
   */
  toTasks(extendedTasks: UiTask[]): TaskoratorTask[] {
    return extendedTasks.map((extendedTask) => this.toTask(extendedTask));
  }

  /**
   * Extract the `taskId` from an array of `ExtendedTask`.
   */
  getIds(tasks: UiTask[]): string[] {
    return tasks.map((task) => task.taskId);
  }
}
