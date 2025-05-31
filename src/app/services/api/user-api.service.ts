import { Injectable } from '@angular/core';
import { setDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { TaskUserInfo } from '../../models/service-strategies/user';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async getUserInfo(): Promise<TaskUserInfo | undefined> {
    const userId = this.getUserId();

    const docRef = doc(this.firestore, this.getUserInfoLocation(userId));
    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...snapshot.data() } as TaskUserInfo;
      } else {
        throw new Error('User info not found');
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error('Failed to retrieve user information');
    }
  }

  async updateUserInfo(userInfo: TaskUserInfo): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.firestore, this.getUserInfoLocation(userId));
    try {
      await setDoc(docRef, userInfo, { merge: true }); // Merge updates only the specified fields
      console.log('User info successfully updated');
    } catch (error) {
      console.error('Failed to update user info:', error);
      throw new Error('Failed to update user information');
    }
  }

  async createUserInfo(userInfo: TaskUserInfo): Promise<void> {
    const userId = this.getUserId();
    const docRef = doc(this.firestore, this.getUserInfoLocation(userId));
    try {
      await setDoc(docRef, userInfo); // Overwrites if the document exists
      console.log('User info successfully created');
    } catch (error) {
      console.error('Failed to create user info:', error);
      throw new Error('Failed to create user information');
    }
  }

  private getUserInfoLocation(userId: string): string {
    return `users/${userId}/userInfos/${userId}`;
  }
}
