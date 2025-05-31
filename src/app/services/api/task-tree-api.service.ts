import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TreeApiStrategy } from '../../models/service-strategies/tree-strategy.interface';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeApiService implements TreeApiStrategy {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async createTree(taskTree: TaskTree): Promise<TaskTree | null> {
    this.validateTreeStructure(taskTree);
    const userId = this.getUserId();
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

  // async updateTree(taskTree: TaskTree): Promise<void> {
  //   const userId = this.getUserId();
  //   const treeDocRef = doc(
  //     this.firestore,
  //     `users/${userId}/taskTrees/${userId}`
  //   ); // firebase store stuff inside stuff with keys, so it has to be inside a unique key
  //   try {
  //     const taskTreeData = JSON.parse(JSON.stringify(taskTree));
  //     await setDoc(treeDocRef, taskTreeData, { merge: true });
  //   } catch (error) {
  //     console.error('Failed to update tree:', error);
  //     throw error;
  //   }
  // }

  private removeCircularReferences(tree: TaskTree): any {
    const seen = new WeakSet();

    return JSON.parse(
      JSON.stringify(tree, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            console.warn('Circular reference found:', key);
            return; // Return undefined to omit the circular reference key
          }
          seen.add(value);
        }
        return value;
      })
    );
  }

  private validateTreeStructure(tree: TaskTree): void {
    console.log('Validating tree structure');
    const invalidNodes: any[] = [];

    const validateNode = (node: TaskTreeNode) => {
      if (!node || typeof node.taskId !== 'string') {
        invalidNodes.push(node);
      } else if (!Array.isArray(node.children)) {
        node.children = []; // Fix invalid children
      }
      (node.children || []).forEach(validateNode);
    };

    validateNode(tree.primarch);

    if (invalidNodes.length > 0) {
      console.error('Invalid nodes detected:', invalidNodes);
      throw new Error('Tree contains invalid nodes.');
    }
  }

  async updateTree(taskTree: TaskTree): Promise<void> {
    this.validateTreeStructure(taskTree);

    const userId = this.getUserId();
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );

    try {
      const taskTreeData = this.removeCircularReferences(taskTree);
      await setDoc(treeDocRef, taskTreeData, { merge: true });
    } catch (error) {
      console.error('Failed to update tree:', error);
      throw error;
    }
  }

  async getTree(): Promise<TaskTree | null> {
    const userId = this.getUserId();
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
