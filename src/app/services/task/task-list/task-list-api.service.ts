import { Injectable } from '@angular/core';
import {
  TASK_LIST_LIMIT,
  TaskListApiStrategy,
  TaskListType,
} from '../../../models/service-strategies/task-list-strategy.interface';
import { Task } from '../../../models/taskModelManager';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  orderBy,
  getDocs,
} from '@angular/fire/firestore';
import { TaskListAssistantService } from './task-list-assistant.service';
/**
 * filters out completed tasks stage==todo is shown only
 * if you want to get tasks that are completed, we will have completed task service later...
 */
@Injectable({
  providedIn: 'root',
})
export class TaskListApiService implements TaskListApiStrategy {
  constructor(
    private firestore: Firestore,
    private taskListAssistant: TaskListAssistantService
  ) {}

  /**
   * Retrieves the latest tasks ordered by creation time.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of tasks.
   */
  async getLatestTasks(userId: string): Promise<Task[] | null> {
    try {
      const tasksCollection = collection(
        this.firestore,
        `users/${userId}/tasks`
      );
      const queryConstraint = query(
        tasksCollection,
        where('stage', '==', 'todo'),
        orderBy('timeCreated', 'desc'),
        limit(TASK_LIST_LIMIT)
      );

      const querySnapshot = await getDocs(queryConstraint);
      if (!querySnapshot.empty) {
        const tasks = querySnapshot.docs.map(
          (doc) => ({ taskId: doc.id, ...doc.data() } as Task)
        );
        return tasks;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching latest tasks:', error);
      throw error;
    }
  }

  /**
  // allow seeing completed tasks... we may want to uncomplete...
 */
  async getLatestUpdatedTasks(userId: string): Promise<Task[] | null> {
    // 13 May 2024 at 20:23:39 UTC+1

    const tasksCollection = collection(this.firestore, `users/${userId}/tasks`);
    const queryConstraint = query(
      tasksCollection,
      orderBy('lastUpdated', 'desc'),
      limit(TASK_LIST_LIMIT)
    );

    const querySnapshot = await getDocs(queryConstraint);
    if (!querySnapshot.empty) {
      const tasks = querySnapshot.docs.map(
        (doc) => ({ taskId: doc.id, ...doc.data() } as Task)
      );
      return tasks;
    } else {
      return null;
    }
  }

  /**
 * limited to 5x task limit, which is 10 at the moment
  we get completed tasks separately for each parent we choose manually in separate component
  */
  async getOverlordTasks(
    userId: string,
    taskId: string
  ): Promise<Task[] | null> {
    const queryConstraints = [
      where('overlord', '==', taskId),
      limit(TASK_LIST_LIMIT * 5),
    ];

    // for now we just use this
    // if (true) {
    queryConstraints.push(where('stage', '==', 'todo'));
    // }

    return this.taskListAssistant.getTasksWithConstraints(
      userId,
      queryConstraints
    );
  }

  async getDailyTasks(
    userId: string,
    filterCompleted: boolean = false
  ): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'daily');
  }

  async getWeeklyTasks(
    userId: string,
    filterCompleted: boolean = false
  ): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'weekly');
  }

  async getMonthlyTasks(
    userId: string,
    filterCompleted: boolean = false
  ): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'monthly');
  }

  async getYearlyTasks(
    userId: string,
    filterCompleted: boolean = false
  ): Promise<Task[] | null> {
    return this.taskListAssistant.getRepeatingTasks(userId, 'yearly');
  }

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

  async getTasks(
    userId: string,
    taskListType: TaskListType
  ): Promise<Task[] | null> {
    throw new Error(
      'use getTasksFromIds(userId: string,taskIds: string[] and pass whatever you need to get'
    );
  }
  /**
   * we don't get tasks that are completed we get them later separately
   * @param userId
   * @param taskIds
   * @returns
   */
  async getTasksFromIds(
    userId: string,
    taskIds: string[]
  ): Promise<Task[] | null> {
    if (taskIds.length === 0) {
      return null;
    }

    const tasksCollection = collection(this.firestore, `users/${userId}/tasks`);
    const tasks: Task[] = [];

    for (let i = 0; i < taskIds.length; i += 10) {
      const batchIds = taskIds.slice(i, i + 10);
      const tasksQuery = query(
        tasksCollection,
        where('taskId', 'in', batchIds),
        where('stage', '==', 'todo'),
        limit(TASK_LIST_LIMIT)
      );
      const querySnapshot = await getDocs(tasksQuery);
      if (!querySnapshot.empty) {
        tasks.push(
          ...querySnapshot.docs.map(
            (doc) => ({ taskId: doc.id, ...doc.data() } as Task)
          )
        );
      }
    }

    return tasks.length > 0 ? tasks : null;
  }
}
