import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  collection,
  doc,
  getDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class SqliteMigrateFirebaseService {
  constructor(private firestore: Firestore) {}

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  async createTasks(tasks: Task[]): Promise<Map<string, DocumentReference>> {
    const idMap = new Map<string, DocumentReference>();
    const chunks = this.chunkArray(tasks, 500); // Split tasks into chunks of 500

    for (const chunk of chunks) {
      const batch = writeBatch(this.firestore);

      chunk.forEach((task) => {
        const taskRef = doc(collection(this.firestore, 'tasks'));
        batch.set(taskRef, {
          ...task,
          overlord: task.overlord ? task.overlord : null,
        });
        idMap.set(task.taskId, taskRef);
      });

      await batch.commit();
    }

    return idMap;
  }

  async updateOverlordReferences(
    idMap: Map<string, DocumentReference>
  ): Promise<void> {
    const entries = Array.from(idMap.entries());
    const chunks = this.chunkArray(entries, 500); // Split idMap entries into chunks

    for (const chunk of chunks) {
      const batch = writeBatch(this.firestore);

      for (const [oldId, taskRef] of chunk) {
        const taskSnapshot = await getDoc(taskRef);
        if (taskSnapshot.exists()) {
          const taskData = taskSnapshot.data();
          if (taskData && taskData['overlord']) {
            const newOverlordRef = idMap.get(taskData['overlord']);
            if (newOverlordRef) {
              batch.update(taskRef, { overlord: newOverlordRef.id });
            }
          }
        }
      }

      await batch.commit();
    }
  }
}
