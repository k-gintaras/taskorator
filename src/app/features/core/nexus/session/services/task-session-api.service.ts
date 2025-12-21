// services/task-session-api.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from '@angular/fire/firestore';
import { TaskSession } from '../task-session.model';
import { AuthService } from '../../../../../services/core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionApiService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private async getUserId(): Promise<string> {
    const userId = await this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async getSessions(): Promise<TaskSession[]> {
    const userId = await this.getUserId();
    try {
      const sessionsCollection = collection(
        this.firestore,
        `users/${userId}/task-sessions`
      );
      const querySnapshot = await getDocs(sessionsCollection);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as TaskSession)
      );
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  }

  async createSession(session: TaskSession): Promise<TaskSession> {
    try {
      const userId = await this.getUserId();
      const sessionsCollection = collection(
        this.firestore,
        `users/${userId}/task-sessions`
      );
      const sessionDocRef = doc(sessionsCollection); // Prepare a new document reference within user's sessions collection
      const sessionData = { ...session, id: sessionDocRef.id }; // Add id to the session

      await setDoc(sessionDocRef, sessionData); // Directly set the new session document with the generated ID
      return sessionData; // Return the session data with the new ID
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  async updateSession(session: TaskSession): Promise<void> {
    try {
      const userId = await this.getUserId();
      const sessionDoc = doc(
        this.firestore,
        `users/${userId}/task-sessions/${session.id}`
      );
      const sessionData = JSON.parse(JSON.stringify(session));
      await updateDoc(sessionDoc, sessionData);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const sessionDoc = doc(
        this.firestore,
        `users/${userId}/task-sessions/${id}`
      );
      await deleteDoc(sessionDoc);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }
}
