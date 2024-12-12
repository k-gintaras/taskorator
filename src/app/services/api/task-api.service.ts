import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  writeBatch,
  getDoc,
  setDoc,
  getDocs,
  query,
  limit,
  orderBy,
  deleteDoc,
} from '@angular/fire/firestore';
import { Task, getDefaultTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskApiService {
  constructor(private firestore: Firestore) {}

  async getTasks(userId: string): Promise<Task[] | null> {
    return null;
  }

  private getTaskCollection(userId: string) {
    return collection(this.firestore, `users/${userId}/tasks`);
  }

  private handleError(method: string, error: unknown): void {
    console.warn(`TaskApiService.${method}:`, error);
  }

  private ensureOverlord(task: Task): Task {
    return { ...task, overlord: task.overlord ?? getDefaultTask().overlord };
  }

  async createTask(userId: string, task: Task): Promise<Task | null> {
    const taskCollection = this.getTaskCollection(userId);
    const taskDocRef = doc(taskCollection);
    const newTask = { ...this.ensureOverlord(task), taskId: taskDocRef.id };

    try {
      await setDoc(taskDocRef, newTask);
      return newTask;
    } catch (error) {
      this.handleError('createTask', error);
      return null;
    }
  }

  async createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task | null> {
    const taskCollection = this.getTaskCollection(userId);
    const taskDocRef = doc(taskCollection, taskId);
    const newTask = { ...this.ensureOverlord(task), taskId };

    try {
      await setDoc(taskDocRef, newTask);
      return newTask;
    } catch (error) {
      this.handleError('createTaskWithCustomId', error);
      return null;
    }
  }

  async updateTask(userId: string, task: Task): Promise<boolean> {
    if (!task.taskId) {
      console.warn('TaskApiService.updateTask: Missing task ID for update');
      return false;
    }

    const taskDocRef = doc(this.getTaskCollection(userId), task.taskId);
    const updatedTask = this.ensureOverlord(task);

    try {
      if (task.stage === 'deleted') {
        await deleteDoc(taskDocRef);
        console.log(`Deleted task: ${task.taskId}`);
      } else {
        await updateDoc(taskDocRef, { ...updatedTask });
      }
      return true;
    } catch (error) {
      this.handleError('updateTask', error);
      return false;
    }
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    const taskDocRef = doc(this.getTaskCollection(userId), taskId);

    try {
      const snapshot = await getDoc(taskDocRef);
      if (snapshot.exists()) {
        return { taskId: snapshot.id, ...snapshot.data() } as Task;
      } else {
        console.warn(`TaskApiService.getTaskById: Task ${taskId} not found`);
        return null;
      }
    } catch (error) {
      this.handleError('getTaskById', error);
      return null;
    }
  }

  async getLatestTaskId(userId: string): Promise<string | null> {
    const taskCollection = this.getTaskCollection(userId);
    const latestTaskQuery = query(
      taskCollection,
      orderBy('timeCreated', 'desc'),
      limit(1)
    );

    try {
      const querySnapshot = await getDocs(latestTaskQuery);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      console.warn('TaskApiService.getLatestTaskId: No tasks found');
      return null;
    } catch (error) {
      this.handleError('getLatestTaskId', error);
      return null;
    }
  }

  async createTasks(userId: string, tasks: Task[]): Promise<Task[] | null> {
    const batch = writeBatch(this.firestore);
    const taskCollection = this.getTaskCollection(userId);
    const newTasks: Task[] = [];

    try {
      tasks.forEach((task) => {
        const taskDocRef = doc(taskCollection, task.taskId || undefined);
        const newTask = { ...this.ensureOverlord(task), taskId: taskDocRef.id };
        batch.set(taskDocRef, newTask);
        newTasks.push(newTask);
      });

      await batch.commit();
      return newTasks;
    } catch (error) {
      this.handleError('createTasks', error);
      return null;
    }
  }

  async updateTasks(userId: string, tasks: Task[]): Promise<boolean> {
    const batch = writeBatch(this.firestore);
    const taskCollection = this.getTaskCollection(userId);

    try {
      tasks.forEach((task) => {
        if (!task.taskId) {
          console.warn(`TaskApiService.updateTasks: Missing task ID for task`);
          return;
        }
        const taskDocRef = doc(taskCollection, task.taskId);
        batch.update(taskDocRef, { ...this.ensureOverlord(task) });
      });

      await batch.commit();
      return true;
    } catch (error) {
      this.handleError('updateTasks', error);
      return false;
    }
  }

  /**
   *
   * @param userId
   * @param overlordId
   * @returns super overlord if we pass task.overlord or overlord if we pass task.taskId
   */
  async getSuperOverlord(
    userId: string,
    overlordId: string
  ): Promise<Task | null> {
    const overlordDocRef = doc(this.getTaskCollection(userId), overlordId);

    try {
      const overlordSnapshot = await getDoc(overlordDocRef);
      if (!overlordSnapshot.exists()) {
        console.warn(
          `TaskApiService.getSuperOverlord: Overlord ${overlordId} not found`
        );
        return null;
      }

      const overlord = overlordSnapshot.data() as Task;
      if (!overlord.overlord) {
        console.warn(
          `TaskApiService.getSuperOverlord: Overlord ${overlordId} has no parent`
        );
        return null;
      }

      const superOverlordDocRef = doc(
        this.getTaskCollection(userId),
        overlord.overlord
      );
      const superOverlordSnapshot = await getDoc(superOverlordDocRef);

      return superOverlordSnapshot.exists()
        ? ({
            taskId: superOverlordSnapshot.id,
            ...superOverlordSnapshot.data(),
          } as Task)
        : null;
    } catch (error) {
      this.handleError('getSuperOverlord', error);
      return null;
    }
  }
}
