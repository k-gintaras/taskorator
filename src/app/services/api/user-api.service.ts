import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { TaskUserInfo } from '../../models/service-strategies/user';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private firestore: Firestore) {}

  async getUserInfo(userId: string): Promise<TaskUserInfo | undefined> {
    if (!userId) {
      throw new Error('User not authenticated');
    }

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

  private getUserInfoLocation(userId: string) {
    return `users/${userId}/userInfos/${userId}`;
  }
}
