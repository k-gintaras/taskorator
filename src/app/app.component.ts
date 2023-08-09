import { Component, OnInit } from '@angular/core';
import { TaskLoaderService } from './services/task-loader.service';
import { LocalService } from './services/local.service';
import { SelectedTaskService } from './services/selected-task.service';
import { SyncService } from './services/sync.service';
import { TaskObjectHelperService } from './services/task-object-helper.service';
import { TaskOverlordFixerService } from './services/task-overlord-fixer.service';
import { Task } from './task-model/taskModelManager';
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

  constructor(private feedbackService: FeedbackService) {
    this.feedbackSubscription = this.feedbackService.feedback$.subscribe(
      (message) => {
        this.feedback = message; // Assign the new message to feedback
      }
    );
  }

  ngOnDestroy(): void {
    this.feedbackSubscription.unsubscribe();
  }
}
