import { Injectable } from '@angular/core';
import { Settings, getDefaultSettings } from '../models/settings';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collectionData,
  docData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings$: Observable<Settings>;
  private readonly settingsDocId = 'yourSettingsDocId';

  constructor(private firestore: Firestore) {
    const settingsDocRef = doc(
      this.firestore,
      `settings/${this.settingsDocId}`
    );
    this.settings$ = docData(settingsDocRef) as Observable<Settings>;

    // this.ensureSettings();
  }

  getSettings(): Observable<Settings> {
    return this.settings$;
  }

  // Function to save settings to Firestore
  async saveSettings(settings: Settings): Promise<void> {
    const settingsDocRef = doc(
      this.firestore,
      `settings/${this.settingsDocId}`
    );
    await setDoc(settingsDocRef, settings);
  }

  // Function to ensure settings exist or create them with default values
  async ensureSettings(): Promise<void> {
    const settingsDocRef = doc(
      this.firestore,
      `settings/${this.settingsDocId}`
    );
    const docSnap = await getDoc(settingsDocRef);

    if (!docSnap.exists()) {
      const defaultSettings = getDefaultSettings();
      await this.saveSettings(defaultSettings);
      console.log('Default settings created');
    }
  }
}
