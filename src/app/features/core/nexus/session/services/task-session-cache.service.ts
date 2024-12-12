// services/task-session-cache.service.ts
import { Injectable } from '@angular/core';
import { TaskSession } from '../task-session.model';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionCacheService {
  private cache: TaskSession[] | null = null;

  getCache(): TaskSession[] | null {
    return this.cache;
  }

  setCache(sessions: TaskSession[]): void {
    this.cache = sessions;
  }

  clearCache(): void {
    this.cache = null;
  }

  updateCache(session: TaskSession): void {
    if (this.cache) {
      const index = this.cache.findIndex((item) => item.id === session.id);
      if (index !== -1) {
        this.cache[index] = session;
      } else {
        this.cache.push(session);
      }
    }
  }

  removeFromCache(sessionId: string): void {
    if (this.cache) {
      this.cache = this.cache.filter((item) => item.id !== sessionId);
    }
  }
}
