import { Injectable } from '@angular/core';
import {
  TaskListStrategy,
  TaskListType,
} from '../../../models/service-strategies/task-list-strategy.interface';
import { Task } from '../../../models/taskModelManager';
import { EventBusService } from '../../core/event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListCacheService implements TaskListStrategy {
  private taskListMap: Map<TaskListType, Task[]> = new Map();
  private looseTasksMap: Map<string, Task> = new Map();
  private overlordTasksMap: Map<string, Task[]> = new Map();
  // looseTasks for taskByIds
  // overlordTasks for overlordTasks id, task[]
  constructor(private eventBusService: EventBusService) {
    this.subscribeToTaskEvents();
  }

  private subscribeToTaskEvents(): void {
    // tasks
    this.eventBusService.onEvent<any>('createTask').subscribe((task) => {
      this.createLooseTasks([task]);
    });
    this.eventBusService.onEvent<any>('createTasks').subscribe((tasks) => {
      this.createLooseTasks(tasks);
    });
    this.eventBusService.onEvent<any>('updateTask').subscribe((task) => {
      this.createLooseTasks([task]);
    });
    this.eventBusService.onEvent<any>('updateTasks').subscribe((tasks) => {
      this.createLooseTasks(tasks);
    });
  }

  async getLatestTasks(): Promise<Task[] | null> {
    return this.getTaskList('latest');
  }

  async getOverlordTasks(taskId: string): Promise<Task[] | null> {
    const tasks = this.overlordTasksMap.get(taskId);
    if (tasks) {
      return tasks;
    } else {
      return null;
    }
  }

  async getDailyTasks(): Promise<Task[] | null> {
    return this.getTaskList('daily');
  }

  async getWeeklyTasks(): Promise<Task[] | null> {
    return this.getTaskList('weekly');
  }

  async getFocusTasks(): Promise<Task[] | null> {
    return this.getTaskList('focus');
  }

  async getTasksToSplit(): Promise<Task[] | null> {
    return this.getTaskList('split');
  }

  async getTasksToCrush(): Promise<Task[] | null> {
    return this.getTaskList('crush');
  }

  async getTasks(taskListType: TaskListType): Promise<Task[] | null> {
    return this.getTaskList(taskListType);
  }

  async getTasksFromIds(taskIds: string[]): Promise<Task[] | null> {
    const tasks: Task[] = [];
    for (const taskId of taskIds) {
      const task = this.looseTasksMap.get(taskId);
      if (!task) {
        return null;
      }
      tasks.push(task);
    }
    return tasks;
  }

  private async getTaskList(
    taskListType: TaskListType
  ): Promise<Task[] | null> {
    const tasks = this.taskListMap.get(taskListType);
    if (tasks) {
      return tasks;
    } else {
      return null;
    }
  }

  async createTaskList(
    taskListType: TaskListType,
    tasks: Task[]
  ): Promise<void> {
    this.taskListMap.set(taskListType, tasks);
  }

  async deleteTaskList(taskListType: TaskListType): Promise<void> {
    this.taskListMap.delete(taskListType);
  }

  async clearAllTaskLists(): Promise<void> {
    this.taskListMap.clear();
  }

  async createLooseTasks(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      this.looseTasksMap.set(task.taskId, task);
    }
  }

  async deleteLooseTask(taskId: string): Promise<void> {
    this.looseTasksMap.delete(taskId);
  }

  async clearAllLooseTasks(): Promise<void> {
    this.looseTasksMap.clear();
  }

  async createOverlordTasks(overlordId: string, tasks: Task[]): Promise<void> {
    this.overlordTasksMap.set(overlordId, tasks);
  }

  async deleteOverlordTasks(overlordId: string): Promise<void> {
    this.overlordTasksMap.delete(overlordId);
  }

  async clearAllOverlordTasks(): Promise<void> {
    this.overlordTasksMap.clear();
  }
}
