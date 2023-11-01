import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private feedbackSubject = new Subject<FeedbackMessage>();
  feedback$ = this.feedbackSubject.asObservable();
  isError$ = false;

  constructor(private snackBar: MatSnackBar) {}

  sendFeedback(text: string, isError: boolean): void {
    this.isError$ = isError;
    this.feedbackSubject.next({ text, isError });
  }

  log(text: string): void {
    console.log('Feedback: ' + text);
    this.feedbackSubject.next({ text, isError: false });
    this.snackBar.open(text, 'Close', {
      duration: 2000,
    });
  }

  error(text: string, error: any): void {
    console.log(error);
    this.feedbackSubject.next({ text, isError: true });
    this.snackBar.open(text, 'Close', {
      duration: 2000,
    });
  }
}

export interface FeedbackMessage {
  text: string;
  isError: boolean;
}
