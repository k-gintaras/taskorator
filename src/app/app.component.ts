import { Component, OnInit } from '@angular/core';
import { TaskLoaderService } from './services/task-loader.service';
import { FeedbackMessage, FeedbackService } from './services/feedback.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'my-app';

  feedback: FeedbackMessage = { text: '', isError: false }; // Change feedbacks array to a single string variable

  private feedbackSubscription: Subscription;
  constructor(
    private feedbackService: FeedbackService,
    private taskLoaderService: TaskLoaderService
  ) {
    this.feedbackSubscription = this.feedbackService.feedback$.subscribe(
      (message) => {
        this.feedback = message; // Assign the new message to feedback
      }
    );
  }

  // ngOnInit() {
  //   this.taskLoaderService.loadTasksSlow().subscribe();
  // }

  // ngOnDestroy(): void {
  //   this.feedbackSubscription.unsubscribe();
  // }
}
