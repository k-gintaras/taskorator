import { Observable } from 'rxjs';

export interface ErrorHandlingStrategy {
  error(error: unknown): void;
  log(error: unknown): void;
  feedback(msg: string): void;
  popup(msg: string): void;
  getFeedback(): Observable<string | null>;
  // Other error handling methods...
}
