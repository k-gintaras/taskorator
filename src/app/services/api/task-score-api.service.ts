import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Score } from '../../models/score';

@Injectable({
  providedIn: 'root',
})
export class TaskScoreApiService {
  constructor(private firestore: Firestore) {}
  async createScore(userId: string, score: Score): Promise<Score | null> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const scoreData = JSON.parse(JSON.stringify(score));
      await setDoc(scoreDocRef, scoreData);
      return score;
    } catch (error) {
      console.error('Failed to create score:', error);
      return null;
    }
  }

  async getScore(userId: string): Promise<Score | null> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const docSnap = await getDoc(scoreDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return JSON.parse(JSON.stringify(data));
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get score:', error);
      return null;
    }
  }

  async updateScore(userId: string, score: Score): Promise<void> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const scoreData = JSON.parse(JSON.stringify(score));
      await setDoc(scoreDocRef, scoreData, { merge: true });
    } catch (error) {
      console.error('Failed to update score:', error);
      throw error;
    }
  }
}
