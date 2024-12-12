import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  orderBy,
  getDocs,
} from '@angular/fire/firestore';
import { Task } from '../../models/taskModelManager';
import { TASK_CONFIG } from '../../app.config';
import { TaskListAssistantApiService } from './task-list-assistant-api.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListApiService {
  TASK_LIST_LIMIT = TASK_CONFIG.TASK_LIST_LIMIT;
  constructor(
    private firestore: Firestore,
    private taskListAssistant: TaskListAssistantApiService
  ) {}

  async getFocusTasks(userId: string): Promise<Task[] | null> {
    // we have to use settings so instead we call getTasksFromIds and pass whatever settings focus told us to get
    throw new Error(
      'use getTasksFromIds(userId: string,taskIds: string[] and pass from settings focus'
    );
  }

  async getTasksToSplit(userId: string): Promise<Task[] | null> {
    // we have to use TREE so instead we call getTasksFromIds and pass whatever tree told us to get
    throw new Error(
      'use getTasksFromIds(userId: string,taskIds: string[] and pass from tree'
    );
  }

  async getTasksToCrush(userId: string): Promise<Task[] | null> {
    // we have to use TREE so instead we call getTasksFromIds and pass whatever tree told us to get
    throw new Error(
      'use getTasksFromIds(userId: string,taskIds: string[] and pass from tree'
    );
  }

  /**
   * Retrieves the latest tasks ordered by creation time.
   */
  async getLatestTasks(userId: string): Promise<Task[] | null> {
    return this.queryTasks(userId, [
      where('stage', '==', 'todo'),
      orderBy('timeCreated', 'desc'),
      limit(this.TASK_LIST_LIMIT),
    ]);
  }

  /**
   * Retrieves the latest updated tasks.
   */
  async getLatestUpdatedTasks(userId: string): Promise<Task[] | null> {
    return this.queryTasks(userId, [
      orderBy('lastUpdated', 'desc'),
      limit(this.TASK_LIST_LIMIT),
    ]);
  }

  /**
   * Retrieves overlord tasks with optional filters.
   */
  async getOverlordTasks(
    userId: string,
    taskId: string
  ): Promise<Task[] | null> {
    const constraints = [
      where('overlord', '==', taskId),
      where('stage', '==', 'todo'), // Default filter for "todo"
      limit(this.TASK_LIST_LIMIT * 5),
    ];
    return this.taskListAssistant.getTasksWithConstraints(userId, constraints);
  }

  /**
   * Retrieves daily repeating tasks.
   */
  async getDailyTasks(userId: string): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'daily');
  }

  /**
   * Retrieves weekly repeating tasks.
   */
  async getWeeklyTasks(userId: string): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'weekly');
  }

  /**
   * Retrieves monthly repeating tasks.
   */
  async getMonthlyTasks(userId: string): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'monthly');
  }

  /**
   * Retrieves yearly repeating tasks.
   */
  async getYearlyTasks(userId: string): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'yearly');
  }

  /**
   * Retrieves tasks by their IDs.
   */
  async getTasksFromIds(
    userId: string,
    taskIds: string[]
  ): Promise<Task[] | null> {
    if (taskIds.length === 0) {
      console.warn('TaskListApiService.getTasksFromIds: No task IDs provided');
      return null;
    }

    const tasks: Task[] = [];
    const tasksCollection = collection(this.firestore, `users/${userId}/tasks`);

    try {
      for (let i = 0; i < taskIds.length; i += 10) {
        const batchIds = taskIds.slice(i, i + 10);
        const queryConstraints = [
          where('taskId', 'in', batchIds),
          where('stage', '==', 'todo'),
        ];
        const querySnapshot = await this.executeQuery(
          tasksCollection,
          queryConstraints
        );

        tasks.push(...querySnapshot);
      }
      return tasks.length > 0 ? tasks : null;
    } catch (error) {
      this.handleError('getTasksFromIds', error);
      return null;
    }
  }

  private async queryTasks(
    userId: string,
    constraints: any[]
  ): Promise<Task[] | null> {
    const tasksCollection = collection(this.firestore, `users/${userId}/tasks`);
    try {
      const querySnapshot = await this.executeQuery(
        tasksCollection,
        constraints
      );
      return querySnapshot.length > 0 ? querySnapshot : null;
    } catch (error) {
      this.handleError('queryTasks', error);
      return null;
    }
  }

  private async executeQuery(
    collectionRef: any,
    constraints: any[]
  ): Promise<Task[]> {
    try {
      const tasksQuery = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (data) {
            return { taskId: doc.id, ...data } as Task;
          } else {
            console.warn(
              `TaskListApiService.executeQuery: Missing data for doc ${doc.id}`
            );
            return null; // Fallback for missing data
          }
        })
        .filter((task): task is Task => task !== null); // Filter out null values
    } catch (error) {
      this.handleError('executeQuery', error);
      return [];
    }
  }

  /**
   * Logs errors and ensures smooth operation.
   */
  private handleError(method: string, error: unknown): void {
    console.warn(`TaskListApiService.${method} failed:`, error);
  }
}
