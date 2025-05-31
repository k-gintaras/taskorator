import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { TaskSession } from '../../features/core/nexus/session/task-session.model';
import { TaskSessionApiStrategy } from '../../models/service-strategies/session-strategy.interface';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionApiService implements TaskSessionApiStrategy {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async getSession(sessionId: string): Promise<TaskSession | null> {
    const userId = this.getUserId();

    const sessionRef = doc(
      this.firestore,
      `users/${userId}/task-sessions/${sessionId}`
    );
    try {
      const sessionSnap = await getDoc(sessionRef);
      return sessionSnap.exists() ? (sessionSnap.data() as TaskSession) : null;
    } catch (error) {
      console.error(`Failed to fetch session with ID ${sessionId}:`, error);
      return null;
    }
  }

  async getSessions(): Promise<TaskSession[]> {
    const userId = this.getUserId();
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
      const userId = this.getUserId();
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
    const userId = this.getUserId();
    const sessionDoc = doc(
      this.firestore,
      `users/${userId}/task-sessions/${session.id}`
    );
    try {
      const sessionData = JSON.parse(JSON.stringify(session));
      await updateDoc(sessionDoc, sessionData);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  async deleteSession(userId: string, id: string): Promise<void> {
    const sessionDoc = doc(
      this.firestore,
      `users/${userId}/task-sessions/${id}`
    );
    try {
      await deleteDoc(sessionDoc);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }
}
