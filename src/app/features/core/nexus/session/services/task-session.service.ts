// services/task-session.service.ts
import { Injectable } from '@angular/core';
import { TaskSessionCacheService } from './task-session-cache.service';
import { TaskSessionApiService } from './task-session-api.service';
import { TaskSession } from '../task-session.model';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionService {
  constructor(
    private cacheService: TaskSessionCacheService,
    private apiService: TaskSessionApiService
  ) {}

  async getSessions(): Promise<TaskSession[]> {
    // Try cache first
    let sessions = this.cacheService.getCache();
    if (sessions) return Promise.resolve(sessions);

    // Try remote API; if it fails (no auth or network), fall back to empty
    try {
      sessions = await this.apiService.getSessions();
      if (sessions) {
        this.cacheService.setCache(sessions);
        return sessions;
      }
    } catch (err) {
      console.warn('TaskSessionService: API getSessions failed, using cache/default', err);
    }

    return [];
  }

  async createSession(session: TaskSession): Promise<void> {
    // Try to persist remotely first
    try {
      const created = await this.apiService.createSession(session);
      // Update cache with created session (includes server-generated id)
      this.cacheService.updateCache(created);
      return;
    } catch (err) {
      console.warn('TaskSessionService: API createSession failed, falling back to local cache', err);
    }

    // Fallback: create locally in cache
    const localId = `local-${Date.now()}`;
    const localSession: TaskSession = { ...session, id: localId };
    const existing = this.cacheService.getCache();
    if (!existing) {
      this.cacheService.setCache([localSession]);
    } else {
      this.cacheService.updateCache(localSession);
    }
    console.log('Session created locally:', localSession);
  }

  async updateSession(session: TaskSession): Promise<void> {
    try {
      await this.apiService.updateSession(session);
    } catch (err) {
      console.warn('TaskSessionService: API updateSession failed, updating local cache', err);
    }
    this.cacheService.updateCache(session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    try {
      await this.apiService.deleteSession(sessionId);
    } catch (err) {
      console.warn('TaskSessionService: API deleteSession failed, removing from local cache', err);
    }
    this.cacheService.removeFromCache(sessionId);
  }
}
