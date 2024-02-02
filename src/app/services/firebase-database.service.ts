import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseService {
  tasks$: Observable<Task[]>;

  constructor(private firestore: Firestore) {
    const itemCollection = collection(this.firestore, 'tasks');

    this.tasks$ = collectionData(itemCollection, {
      idField: 'taskId',
    }) as Observable<Task[]>;
  }

  fetchTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  async updateTask(task: Task): Promise<void> {
    if (!task.taskId) {
      throw new Error('Missing task ID');
    }
    const taskDocRef = doc(this.firestore, `tasks/${task.taskId}`);
    return updateDoc(taskDocRef, { ...task });
  }

  async createTask(task: Task): Promise<Task> {
    const taskCollectionRef = collection(this.firestore, 'tasks');
    const docRef = await addDoc(taskCollectionRef, task);
    return { ...task, taskId: docRef.id };
  }

  async deleteTask(taskId: string): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDocRef);
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    tasks.forEach((task) => {
      if (!task.taskId) {
        throw new Error('Missing task ID');
      }
      const taskDocRef = doc(this.firestore, `tasks/${task.taskId}`);
      batch.update(taskDocRef, { ...task });
    });

    return batch.commit();
  }

  async createTasks(tasks: Task[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    tasks.forEach((task) => {
      const taskCollectionRef = collection(this.firestore, 'tasks');
      const taskDocRef = doc(taskCollectionRef);
      batch.set(taskDocRef, task);
    });

    return batch.commit();
  }
}
