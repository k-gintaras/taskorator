import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { getDefaultTaskSettings, TaskSettings } from '../../models/settings';
import { SettingsApiStrategy } from '../../models/service-strategies/settings-strategy.interface';
import { AuthService } from '../core/auth.service';
@Injectable({
  providedIn: 'root',
})
export class TaskSettingsApiService implements SettingsApiStrategy {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async createSettings(settings: TaskSettings): Promise<TaskSettings | null> {
    const userId = this.getUserId();
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const settingsData = JSON.parse(JSON.stringify(settings));
      await setDoc(settingsDocRef, settingsData);
      return settings;
    } catch (error) {
      console.error('Failed to create settings:', error);
      return null;
    }
  }

  async getSettings(): Promise<TaskSettings | null> {
    const userId = this.getUserId();
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...getDefaultTaskSettings(), // Start with default settings
          ...data, // Override with data from the database
        };
      } else {
        return getDefaultTaskSettings(); // Return default settings if none exist
      }
    } catch (error) {
      console.error('Failed to get settings:', error);
      return getDefaultTaskSettings(); // Return default settings in case of error
    }
  }

  async updateSettings(settings: TaskSettings): Promise<void> {
    const userId = this.getUserId();
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const settingsData = JSON.parse(JSON.stringify(settings));
      await setDoc(settingsDocRef, settingsData, { merge: true });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }
}
