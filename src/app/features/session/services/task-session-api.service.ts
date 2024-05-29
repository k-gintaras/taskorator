// services/task-session-api.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from '@angular/fire/firestore';
import { TaskSession } from '../task-session.model';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionApiService {
  constructor(private firestore: Firestore) {}

  async getSessions(userId: string): Promise<TaskSession[]> {
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

  async createSession(
    userId: string,
    session: TaskSession
  ): Promise<TaskSession> {
    try {
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

  async updateSession(userId: string, session: TaskSession): Promise<void> {
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
