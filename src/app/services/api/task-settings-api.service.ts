import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { getDefaultTaskSettings, TaskSettings } from '../../models/settings';
@Injectable({
  providedIn: 'root',
})
export class TaskSettingsApiService {
  constructor(private firestore: Firestore) {}

  async createSettings(
    userId: string,
    settings: TaskSettings
  ): Promise<TaskSettings | null> {
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

  async getSettings(userId: string): Promise<TaskSettings | null> {
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

  async updateSettings(userId: string, settings: TaskSettings): Promise<void> {
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
