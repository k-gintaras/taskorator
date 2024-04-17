import { Injectable } from '@angular/core';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandlingStrategy {
  private feedbackSubject = new BehaviorSubject<string | null>(null);

  ERROR_NOT_LOGGED_IN = 'Login first please.';
  ERROR_NOT_VALID_TASK = 'Problem with task. Maybe wrong parent or bad name.';

  constructor(private snackBar: MatSnackBar) {}
  error(error: unknown): void {
    console.log(error);
  }

  getFeedback(): Observable<string | null> {
    return this.feedbackSubject.asObservable();
  }

  log(error: unknown): void {
    console.log(error);
  }

  popup(msg: string): void {
    console.log(msg);
    this.snackBar.open(msg, 'Close', {
      duration: 2000,
    });
  }

  feedback(msg: string): void {
    console.log(msg);
    this.feedbackSubject.next(msg);
  }
}
