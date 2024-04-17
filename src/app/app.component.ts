import { Component, OnInit } from '@angular/core';
import { FeedbackMessage, FeedbackService } from './services/feedback.service';
import { Subscription } from 'rxjs';
import { TreeService } from './services/core/tree.service';
import { ScoreService } from './services/core/score.service';
import { ServiceInitiatorService } from './services/core/service-initiator.service';
import { ConfigService } from './services/core/config.service';
import { ErrorService } from './services/core/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'taskorator';
  testing = true;
  authenticated = true;

  feedback = ''; // Change feedbacks array to a single string variable

  private feedbackSubscription: Subscription;
  // we init services here so their listeners are able to activate when necessary, because these services are kinda updated in background with eventBus
  constructor(
    private serviceInitiator: ServiceInitiatorService,
    private errorService: ErrorService,
    private config: ConfigService
  ) {
    this.feedbackSubscription = this.errorService
      .getFeedback()
      .subscribe((message) => {
        if (message) this.feedback = message; // Assign the new message to feedback
      });
  }

  async ngOnInit(): Promise<void> {
    await this.serviceInitiator.waitForInitialization();
    this.testing = this.config.isTesting();
    this.authenticated = this.config.getAuthStrategy().isAuthenticated();
    console.log('Authenticated: ' + this.authenticated);
    // Proceed with the login process or other initialization tasks
  }

  // ngOnInit() {
  //   this.taskLoaderService.loadTasksSlow().subscribe();
  // }

  // ngOnDestroy(): void {
  //   this.feedbackSubscription.unsubscribe();
  // }
}
