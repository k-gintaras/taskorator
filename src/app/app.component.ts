import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigService } from './services/core/config.service';
import { ErrorService } from './services/core/error.service';
import { ServiceInitiatorService } from './services/core/service-initiator.service';
import { NgIf } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
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
}
