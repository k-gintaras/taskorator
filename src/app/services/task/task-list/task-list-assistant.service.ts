import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Task } from '../../../models/taskModelManager';
import { TASK_LIST_LIMIT } from '../../../models/service-strategies/task-list-strategy.interface';
import { TaskTree, TaskTreeNode } from '../../../models/taskTree';
import { TreeNodeService } from '../../core/tree-node.service';

@Injectable({
  providedIn: 'root',
})
export class TaskListAssistantService {
  constructor(
    private firestore: Firestore,
    private taskTreeNodeService: TreeNodeService
  ) {}

  // crush or split:
  /**
   * Retrieves tasks that should be split into smaller tasks.
   * These tasks are identified by having a significant number of total descendants
   * or by being deeply nested within the task tree.
   * @param taskTree - The root of the task tree.
   * @returns An array of tasks that should be split.
   */
  getTasksToSplit(taskTree: TaskTree): TaskTreeNode[] {
    const tasksToSplit: TaskTreeNode[] = [];

    const traverse = (task: TaskTreeNode) => {
      if (
        this.taskTreeNodeService.hasManyDescendants(task, 20) ||
        this.taskTreeNodeService.isDeeplyNested(task, 3)
      ) {
        tasksToSplit.push(task);
      }
      task.children.forEach(traverse);
    };

    traverse(taskTree.root);
    return tasksToSplit;
  }

  /**
   * Retrieves tasks that should be crushed and organized.
   * These tasks have a high number of immediate children and can become bottlenecks.
   * @param taskTree - The root of the task tree.
   * @returns An array of tasks that should be crushed.
   */
  getTasksToCrush(taskTree: TaskTree): TaskTreeNode[] {
    const tasksToCrush: TaskTreeNode[] = [];

    const traverse = (task: TaskTreeNode) => {
      if (task.children.length > 10) {
        // Example threshold
        tasksToCrush.push(task);
      }
      task.children.forEach(traverse);
    };

    traverse(taskTree.root);
    return tasksToCrush;
  }

  // task repetition:
  async getRepeatingTasks(
    userId: string,
    repeatInterval: string
  ): Promise<Task[] | null> {
    const queryConstraints: QueryConstraint[] = [
      where('repeat', '==', repeatInterval),
      limit(TASK_LIST_LIMIT),
    ];
    return this.getTasksWithConstraints(userId, queryConstraints);
  }

  private calculatePeriodTimes(repeatInterval: string): {
    startTime: number;
    endTime: number;
  } {
    let startTime: number;
    let endTime: number;
    const currentDate = new Date();

    switch (repeatInterval) {
      case 'daily':
        currentDate.setHours(0, 0, 0, 0);
        startTime = currentDate.getTime();
        endTime = startTime + 24 * 60 * 60 * 1000; // Next day start
        break;
      case 'weekly':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startTime = startOfWeek.getTime();
        endTime = startTime + 7 * 24 * 60 * 60 * 1000; // Next week start
        break;
      case 'monthly':
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        startOfMonth.setHours(0, 0, 0, 0);
        startTime = startOfMonth.getTime();
        const nextMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
        endTime = nextMonth.getTime(); // Next month start
        break;
      case 'yearly':
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        startTime = startOfYear.getTime();
        const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
        endTime = nextYear.getTime(); // Next year start
        break;
      default:
        currentDate.setHours(0, 0, 0, 0);
        startTime = currentDate.getTime();
        endTime = startTime + 24 * 60 * 60 * 1000; // Default to daily
        break;
    }

    return { startTime, endTime };
  }

  public filterTasks(
    tasks: Task[],
    filterCompleted: boolean,
    repeatInterval: string
  ): Task[] {
    if (!filterCompleted) {
      return tasks;
    }

    const { startTime, endTime } = this.calculatePeriodTimes(repeatInterval);

    const filteredTasks = tasks.filter((task) => {
      const isOutsideCurrentPeriod =
        task.lastUpdated < startTime || task.lastUpdated >= endTime;
      // console.log(
      //   `Task ${task.taskId} lastUpdated: ${task.lastUpdated}, startTime: ${startTime}, endTime: ${endTime}, isOutsideCurrentPeriod: ${isOutsideCurrentPeriod}`
      // );
      return isOutsideCurrentPeriod;
    });

    return filteredTasks;
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
}
