// services/task-session.service.ts
import { Injectable } from '@angular/core';
import { TaskSessionCacheService } from './task-session-cache.service';
import { TaskSessionApiService } from './task-session-api.service';
import { TaskSession } from '../task-session.model';
import { AuthService } from '../../../../../services/core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskSessionService {
  constructor(
    private cacheService: TaskSessionCacheService,
    private apiService: TaskSessionApiService,
    private auth: AuthService
  ) {}

  async getSessions(): Promise<TaskSession[]> {
    const userId = await this.auth.getCurrentUserId();
    if (!userId) return [];
    let sessions = this.cacheService.getCache();
    if (sessions) {
      return Promise.resolve(sessions);
    } else {
      sessions = await this.apiService.getSessions(userId);
      this.cacheService.setCache(sessions);
      return sessions;
    }
  }

  async createSession(session: TaskSession): Promise<void> {
    const userId = await this.auth.getCurrentUserId();
    if (!userId) return;
    try {
      const createdSession = await this.apiService.createSession(
        userId,
        session
      );
      this.cacheService.updateCache(createdSession); // Use the returned session with its new ID
      console.log('Session created successfully:', createdSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  async updateSession(session: TaskSession): Promise<void> {
    const userId = await this.auth.getCurrentUserId();
    if (!userId) return;
    await this.apiService.updateSession(userId, session);
    this.cacheService.updateCache(session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    const userId = await this.auth.getCurrentUserId();
    if (!userId) return;
    await this.apiService.deleteSession(userId, sessionId);
    this.cacheService.removeFromCache(sessionId);
  }
}
