import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  orderBy,
  getDocs,
  doc,
  getDoc,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Task } from '../../models/taskModelManager';
import { TASK_CONFIG } from '../../app.config';
import { AuthService } from '../core/auth.service';
import { TaskListApiStrategy } from '../../models/service-strategies/task-list-strategy.interface';
import { TaskListKey } from '../../models/task-list-model';
import { TaskSettings, getDefaultTaskSettings } from '../../models/settings';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TreeNodeService } from '../tree/tree-node.service';
import { TaskSession } from '../../features/core/nexus/session/task-session.model';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListApiService implements TaskListApiStrategy {
  TASK_LIST_LIMIT = TASK_CONFIG.TASK_LIST_LIMIT;
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private treeNodeToolsService: TaskTreeNodeToolsService
  ) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  private async getSettings(userId: string): Promise<TaskSettings | null> {
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...getDefaultTaskSettings(),
          ...data,
        };
      } else {
        return getDefaultTaskSettings();
      }
    } catch (error) {
      console.error('Failed to get settings:', error);
      return getDefaultTaskSettings();
    }
  }

  async getFocusTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();
    const settings = await this.getSettings(userId);
    return settings?.focusTaskIds
      ? this.getTasksFromIds(settings.focusTaskIds)
      : null;
  }

  async getFavoriteTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();
    const settings = await this.getSettings(userId);
    return settings?.favoriteTaskIds
      ? this.getTasksFromIds(settings.favoriteTaskIds)
      : null;
  }

  async getFrogTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();
    const settings = await this.getSettings(userId);
    return settings?.frogTaskIds
      ? this.getTasksFromIds(settings.frogTaskIds)
      : null;
  }

  getTasksByType(taskListKey: TaskListKey): Promise<Task[] | null> {
    switch (taskListKey.type) {
      case 'daily':
        return this.getDailyTasks();
      case 'weekly':
        return this.getWeeklyTasks();
      case 'monthly':
        return this.getMonthlyTasks();
      case 'yearly':
        return this.getYearlyTasks();
      case 'focus':
        return this.getFocusTasks();
      case 'frog':
        return this.getFrogTasks();
      case 'favorite':
        return this.getFavoriteTasks();
      case 'latestUpdated':
        return this.getLatestUpdatedTasks();
      case 'latestCreated':
        return this.getLatestCreatedTasks();
      case 'overlord':
        return this.getOverlordTasks(taskListKey.data);
      case 'session':
        return this.getSessionTasks(taskListKey.data);
      default:
        return Promise.resolve(null);
    }
  }

  async getSessionTasks(sessionId: string): Promise<Task[] | null> {
    const session = await this.getSession(sessionId);
    return session?.taskIds ? this.getTasksFromIds(session.taskIds) : null;
  }

  private async getSession(sessionId: string): Promise<TaskSession | null> {
    const userId = this.getUserId();

    const sessionRef = doc(
      this.firestore,
      `users/${userId}/task-sessions/${sessionId}`
    );
    try {
      const sessionSnap = await getDoc(sessionRef);
      return sessionSnap.exists() ? (sessionSnap.data() as TaskSession) : null;
    } catch (error) {
      console.error(`Failed to fetch session with ID ${sessionId}:`, error);
      return null;
    }
  }

  private async getTree(userId: string): Promise<TaskTree | null> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );
    try {
      const docSnap = await getDoc(treeDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as TaskTree;
      } else {
        console.warn('No task tree found for user');
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch task tree:', error);
      return null;
    }
  }

  private async getTaskIdsToSplit(
    userId: string
  ): Promise<TaskTreeNode[] | null> {
    const taskTree = await this.getTree(userId);
    if (!taskTree) {
      return null;
    }

    const tasksToSplit: TaskTreeNode[] = [];
    const traverse = (node: TaskTreeNode) => {
      if (
        this.treeNodeToolsService.hasManyDescendants(node, 20) ||
        this.treeNodeToolsService.isDeeplyNested(node, 3)
      ) {
        tasksToSplit.push(node);
      }
      node.children.forEach(traverse);
    };

    traverse(taskTree.primarch);
    return tasksToSplit.length > 0 ? tasksToSplit : null;
  }

  private async getTaskIdsToCrush(
    userId: string
  ): Promise<TaskTreeNode[] | null> {
    const taskTree = await this.getTree(userId);
    if (!taskTree) {
      return null;
    }

    const tasksToCrush: TaskTreeNode[] = [];
    const traverse = (node: TaskTreeNode) => {
      if (node.children.length > 10) {
        tasksToCrush.push(node);
      }
      node.children.forEach(traverse);
    };

    traverse(taskTree.primarch);
    return tasksToCrush.length > 0 ? tasksToCrush : null;
  }

  async getTasksToSplit(): Promise<Task[] | null> {
    const userId = this.getUserId();
    const nodes: TaskTreeNode[] | null = await this.getTaskIdsToSplit(userId);
    if (!nodes) return null;
    const ids = nodes.map((n) => n.taskId);
    return this.getTasksFromIds(ids);
  }

  async getTasksToCrush(): Promise<Task[] | null> {
    const userId = this.getUserId();
    const nodes: TaskTreeNode[] | null = await this.getTaskIdsToCrush(userId);
    if (!nodes) return null;
    const ids = nodes.map((n) => n.taskId);
    return this.getTasksFromIds(ids);
  }

  /**
   * Retrieves the latest tasks ordered by creation time.
   */
  async getLatestCreatedTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.queryTasks(userId, [
      where('stage', '==', 'todo'),
      orderBy('timeCreated', 'desc'),
      limit(this.TASK_LIST_LIMIT),
    ]);
  }

  /**
   * Retrieves the latest updated tasks.
   */
  async getLatestUpdatedTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.queryTasks(userId, [
      orderBy('lastUpdated', 'desc'),
      limit(this.TASK_LIST_LIMIT),
    ]);
  }

  /**
   * Retrieves overlord tasks with optional filters.
   */
  async getOverlordTasks(taskId: string): Promise<Task[] | null> {
    const userId = this.getUserId();

    const constraints = [
      where('overlord', '==', taskId),
      where('stage', '==', 'todo'), // Default filter for "todo"
      limit(this.TASK_LIST_LIMIT * 5),
    ];
    return this.getTasksWithConstraints(userId, constraints);
  }

  /**
   * Retrieves daily repeating tasks.
   */
  async getDailyTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.getRepeatingTasks(userId, 'daily');
  }

  /**
   * Retrieves weekly repeating tasks.
   */
  async getWeeklyTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.getRepeatingTasks(userId, 'weekly');
  }

  /**
   * Retrieves monthly repeating tasks.
   */
  async getMonthlyTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.getRepeatingTasks(userId, 'monthly');
  }

  /**
   * Retrieves yearly repeating tasks.
   */
  async getYearlyTasks(): Promise<Task[] | null> {
    const userId = this.getUserId();

    return this.getRepeatingTasks(userId, 'yearly');
  }

  // task repetition:
  async getRepeatingTasks(
    userId: string,
    repeatInterval: string
  ): Promise<Task[] | null> {
    const queryConstraints: QueryConstraint[] = [
      where('repeat', '==', repeatInterval),
      limit(TASK_CONFIG.TASK_LIST_LIMIT),
    ];
    return this.getTasksWithConstraints(userId, queryConstraints);
  }

  async getTasksWithConstraints(
    userId: string,
    queryConstraints: QueryConstraint[]
  ): Promise<Task[] | null> {
    try {
      const tasksCollection = collection(
        this.firestore,
        `users/${userId}/tasks`
      );
      const taskQuery = query(tasksCollection, ...queryConstraints);
      const querySnapshot = await getDocs(taskQuery);

      if (!querySnapshot.empty) {
        const tasks = querySnapshot.docs.map(
          (doc) => ({ taskId: doc.id, ...doc.data() } as Task)
        );
        return tasks;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching tasks with constraints:', error);
      throw error;
    }
  }

  /**
   * Retrieves tasks by their IDs.
   */
  async getTasksFromIds(taskIds: string[]): Promise<Task[] | null> {
    const userId = this.getUserId();

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
