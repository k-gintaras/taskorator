import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private feedbackSubject = new Subject<FeedbackMessage>();
  feedback$ = this.feedbackSubject.asObservable();
  isError$ = false;

  sendFeedback(text: string, isError: boolean): void {
    this.isError$ = isError;
    this.feedbackSubject.next({ text, isError });
  }
}

export interface FeedbackMessage {
  text: string;
  isError: boolean;
}
