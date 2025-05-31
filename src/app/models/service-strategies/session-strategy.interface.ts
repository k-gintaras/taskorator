import { Observable } from 'rxjs/internal/Observable';
import { TaskSession } from '../../features/core/nexus/session/task-session.model';

export interface TaskSessionApiStrategy {
  getSession(sessionId: string): Promise<TaskSession | null>;
  getSessions(): Promise<TaskSession[]>;
  updateSession(session: TaskSession): Promise<void>;
  createSession(session: TaskSession): Promise<TaskSession | null>;
}

export interface TaskSessionStrategy {
  createSession(session: TaskSession): Promise<TaskSession | null>;
  getSession(sessionId: string): Observable<TaskSession | null>;
  getSessions(): Observable<TaskSession[]>;
  updateSession(session: TaskSession): Promise<void>;
}
