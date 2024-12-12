import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { TaskTree } from '../../models/taskTree';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeApiService {
  constructor(private firestore: Firestore) {}

  async createTree(
    userId: string,
    taskTree: TaskTree
  ): Promise<TaskTree | null> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );
    try {
      await setDoc(treeDocRef, taskTree);
      return taskTree;
    } catch (error) {
      console.error('Failed to create tree:', error);
      throw new Error('Task tree creation failed');
    }
  }

  async updateTree(userId: string, taskTree: TaskTree): Promise<void> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    ); // firebase store stuff inside stuff with keys, so it has to be inside a unique key
    try {
      const taskTreeData = JSON.parse(JSON.stringify(taskTree));
      await setDoc(treeDocRef, taskTreeData, { merge: true });
    } catch (error) {
      console.error('Failed to update tree:', error);
      throw error;
    }
  }

  async getTree(userId: string): Promise<TaskTree | null> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );
    try {
      const docSnap = await getDoc(treeDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as TaskTree;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get tree:', error);
      return null;
    }
  }
}
