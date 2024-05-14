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
    repeatInterval: string,
    filterCompleted: boolean = false
  ): Promise<Task[] | null> {
    const queryConstraints: QueryConstraint[] = [
      where('repeat', '==', repeatInterval),
      limit(TASK_LIST_LIMIT),
    ];

    // Apply filter for completed tasks if needed
    this.addCompletedFilterConstraints(
      queryConstraints,
      filterCompleted,
      repeatInterval
    );

    return this.getTasksWithConstraints(userId, queryConstraints);
  }

  private addCompletedFilterConstraints(
    constraints: QueryConstraint[],
    filterCompleted: boolean,
    repeatInterval: string
  ): void {
    if (filterCompleted) {
      const now = Date.now();
      let startTime: number;

      switch (repeatInterval) {
        case 'daily':
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          startTime = startOfDay.getTime();
          break;
        case 'weekly':
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          startTime = startOfWeek.getTime();
          break;
        case 'monthly':
          const startOfMonth = new Date();
          startOfMonth.setFullYear(
            startOfMonth.getFullYear(),
            startOfMonth.getMonth(),
            1
          );
          startOfMonth.setHours(0, 0, 0, 0);
          startTime = startOfMonth.getTime();
          break;
        case 'yearly':
          const startOfYear = new Date();
          startOfYear.setFullYear(startOfYear.getFullYear(), 0, 1);
          startOfYear.setHours(0, 0, 0, 0);
          startTime = startOfYear.getTime();
          break;
        default:
          const defaultStartOfDay = new Date();
          defaultStartOfDay.setHours(0, 0, 0, 0);
          startTime = defaultStartOfDay.getTime();
          break;
      }

      constraints.push(where('timeCompleted', '<', startTime));
    }
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
