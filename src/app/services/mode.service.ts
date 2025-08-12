import { Injectable } from '@angular/core';
import { OTHER_CONFIG } from '../app.config';

@Injectable({ providedIn: 'root' })
export class ModeService {
  private readonly key = 'pref_mode';

  constructor() {
    // initialize default mode from config if not set
    if (!localStorage.getItem(this.key)) {
      const defaultMode: 'online' | 'offline' = OTHER_CONFIG.OFFLINE_TESTING ? 'offline' : 'online';
      localStorage.setItem(this.key, defaultMode);
    }
  }

  get(): 'online' | 'offline' {
    return (localStorage.getItem(this.key) as 'online' | 'offline')!;
  }

  set(mode: 'online' | 'offline') {
    if (this.get() !== mode) {
      localStorage.setItem(this.key, mode);
      location.reload(); // rebind DI on reload
    }
  }
}
