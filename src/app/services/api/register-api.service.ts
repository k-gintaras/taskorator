import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  runTransaction,
} from '@angular/fire/firestore';
import { RegisterUserResult } from '../../models/register-user';
import { Score } from '../../models/score';
import { TaskUserInfo } from '../../models/service-strategies/user';
import { TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
@Injectable({
  providedIn: 'root',
})
export class RegisterApiService {
  constructor(private firestore: Firestore) {}

  async register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: TaskSettings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult> {
    const firestore = this.firestore;
    console.log('registering: ' + userId);
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        doc(firestore, `users/${userId}`);
        const userProfile: TaskUserInfo = {
          canCreate: false,
          allowedTemplates: [], // Initially empty, or predefined IDs could be listed here
          canUseGpt: false,
          role: 'basic',
          registered: true,
        };

        // Handling task creation within the transaction
        const userTaskCollectionRef = collection(
          firestore,
          this.getTasksLocation(userId)
        );
        const initialTaskDocRef = doc(
          userTaskCollectionRef,
          initialTask.taskId
        );
        transaction.set(initialTaskDocRef, initialTask);
        additionalTasks.forEach((task) => {
          const taskDocRef = doc(userTaskCollectionRef, task.taskId);
          transaction.set(taskDocRef, task);
        });

        // Settings, Score, and TaskTree
        const userInfoDocRef = doc(firestore, this.getUserInfoLocation(userId));
        transaction.set(userInfoDocRef, userProfile);
        // Settings, Score, and TaskTree
        const settingsDocRef = doc(firestore, this.getSettingsLocation(userId));
        transaction.set(settingsDocRef, settings);
        const scoreDocRef = doc(firestore, this.getScoreLocation(userId));
        transaction.set(scoreDocRef, score);
        const treeDocRef = doc(firestore, this.getTreeLocation(userId));
        transaction.set(treeDocRef, tree);
      });

      return {
        success: true,
        message: 'User registration successful',
        userId: userId,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw {
        success: false,
        message: 'User registration failed',
      };
    }
  }

  private getUserInfoLocation(userId: string) {
    return `users/${userId}/userInfos/${userId}`;
  }

  private getScoreLocation(userId: string) {
    return `users/${userId}/scores/${userId}`;
  }

  private getSettingsLocation(userId: string) {
    return `users/${userId}/settings/${userId}`;
  }

  private getTasksLocation(userId: string) {
    return `users/${userId}/tasks`;
  }

  private getTreeLocation(userId: string) {
    return `users/${userId}/taskTrees/${userId}`;
  }
}
