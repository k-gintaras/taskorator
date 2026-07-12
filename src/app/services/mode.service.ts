import { Injectable } from '@angular/core';
import { OTHER_CONFIG } from '../app.config';

@Injectable({ providedIn: 'root' })
export class ModeService {
  private readonly key = 'pref_mode';

  constructor() {
    if (!localStorage.getItem(this.key)) {
      localStorage.setItem(this.key, 'online');
    }

    if (OTHER_CONFIG.OFFLINE_TESTING) {
      console.log('ModeService: Offline mode support remains available behind config flags.');
    }
  }

  get(): 'online' | 'offline' {
    return (localStorage.getItem(this.key) as 'online' | 'offline')!;
  }

  set(mode: 'online' | 'offline') {
    if (this.get() !== mode) {
      console.log('ModeService: Switching mode from', this.get(), 'to', mode);
      localStorage.setItem(this.key, mode);
      setTimeout(() => location.reload(), 50);
    }
  }
}
