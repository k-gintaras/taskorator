import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  runTransaction,
} from '@angular/fire/firestore';
import { Score } from '../../models/score';
import {
  RegisterUserResult,
  TaskUserInfo,
} from '../../models/service-strategies/user';
import { TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';
import { TaskTree } from '../../models/taskTree';
import { AuthService } from '../core/auth.service';
import {
  RegistrationApiStrategy,
  RegistrationData,
} from '../../models/service-strategies/registration-strategy';
import { KeyApiService } from './key-api.service';
import { UserApiService } from './user-api.service';
@Injectable({
  providedIn: 'root',
})
export class RegisterApiService implements RegistrationApiStrategy {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private apiKeyService: KeyApiService,
    private userService: UserApiService
  ) {}

  async register(
    registrationData: RegistrationData
  ): Promise<RegisterUserResult> {
    const firestore = this.firestore;
    const userId = this.getUserId();

    try {
      await runTransaction(firestore, async (transaction) => {
        doc(firestore, `users/${userId}`);
        const userProfile: TaskUserInfo = registrationData.userInfo;

        // Handling task creation within the transaction
        const userTaskCollectionRef = collection(
          firestore,
          this.getTasksLocation(userId)
        );
        const initialTaskDocRef = doc(
          userTaskCollectionRef,
          registrationData.initialTask.taskId
        );
        transaction.set(initialTaskDocRef, registrationData.initialTask);
        registrationData.additionalTasks.forEach((task) => {
          const taskDocRef = doc(userTaskCollectionRef, task.taskId);
          transaction.set(taskDocRef, task);
        });

        // Settings, Score, and TaskTree
        const userInfoDocRef = doc(firestore, this.getUserInfoLocation(userId));
        transaction.set(userInfoDocRef, userProfile);
        // Settings, Score, and TaskTree
        const settingsDocRef = doc(firestore, this.getSettingsLocation(userId));
        transaction.set(settingsDocRef, registrationData.settings);
        const scoreDocRef = doc(firestore, this.getScoreLocation(userId));
        transaction.set(scoreDocRef, registrationData.score);
        const treeDocRef = doc(firestore, this.getTreeLocation(userId));
        transaction.set(treeDocRef, registrationData.tree);
      });

      // api key generated when user logs in 2nd time
      // we check if user "can use gpt"
      // but we still have to check on server for "allowed keys"
      // this.generateApiKey(); // we allow certain api keys on the API, thats it...
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

  generateApiKey(): void {
    this.apiKeyService.generateApiKey().then();
  }

  deleteUser(): Promise<void> {
    return this.deleteCurrentUser();
  }

  getUserInfo(): Promise<TaskUserInfo | undefined> {
    return this.userService.getUserInfo();
  }

  createUserInfo(userInfo: TaskUserInfo): Promise<void> {
    return this.userService.createUserInfo(userInfo);
  }

  updateUserInfo(userInfo: TaskUserInfo): Promise<void> {
    return this.userService.updateUserInfo(userInfo);
  }

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async deleteCurrentUser(): Promise<void> {
    return await this.authService.deleteCurrentUser();
  }

  // async register(
  //   initialTask: Task,
  //   additionalTasks: Task[],
  //   settings: TaskSettings,
  //   score: Score,
  //   tree: TaskTree
  // ): Promise<RegisterUserResult> {
  //   const firestore = this.firestore;
  //   const userId = this.getUserId();

  //   try {
  //     await runTransaction(firestore, async (transaction) => {
  //       doc(firestore, `users/${userId}`);
  //       const userProfile: TaskUserInfo = {
  //         canCreate: false,
  //         allowedTemplates: [], // Initially empty, or predefined IDs could be listed here
  //         canUseGpt: false,
  //         role: 'basic',
  //         registered: true,
  //       };

  //       // Handling task creation within the transaction
  //       const userTaskCollectionRef = collection(
  //         firestore,
  //         this.getTasksLocation(userId)
  //       );
  //       const initialTaskDocRef = doc(
  //         userTaskCollectionRef,
  //         initialTask.taskId
  //       );
  //       transaction.set(initialTaskDocRef, initialTask);
  //       additionalTasks.forEach((task) => {
  //         const taskDocRef = doc(userTaskCollectionRef, task.taskId);
  //         transaction.set(taskDocRef, task);
  //       });

  //       // Settings, Score, and TaskTree
  //       const userInfoDocRef = doc(firestore, this.getUserInfoLocation(userId));
  //       transaction.set(userInfoDocRef, userProfile);
  //       // Settings, Score, and TaskTree
  //       const settingsDocRef = doc(firestore, this.getSettingsLocation(userId));
  //       transaction.set(settingsDocRef, settings);
  //       const scoreDocRef = doc(firestore, this.getScoreLocation(userId));
  //       transaction.set(scoreDocRef, score);
  //       const treeDocRef = doc(firestore, this.getTreeLocation(userId));
  //       transaction.set(treeDocRef, tree);
  //     });

  //     return {
  //       success: true,
  //       message: 'User registration successful',
  //       userId: userId,
  //     };
  //   } catch (error) {
  //     console.error('Registration failed:', error);
  //     throw {
  //       success: false,
  //       message: 'User registration failed',
  //     };
  //   }
  // }

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
