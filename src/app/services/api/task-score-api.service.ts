import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Score } from '../../models/score';
import { ScoreApiStrategy } from '../../models/service-strategies/score-strategy.interface copy';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskScoreApiService implements ScoreApiStrategy {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async createScore(score: Score): Promise<Score | null> {
    const userId = this.getUserId();
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

  async getScore(): Promise<Score | null> {
    const userId = this.getUserId();
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

  async updateScore(score: Score): Promise<void> {
    const userId = this.getUserId();
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
