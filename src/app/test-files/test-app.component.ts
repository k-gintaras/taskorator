import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { ErrorService } from '../services/core/error.service';
import { ArtificerComponent } from '../components/artificer/artificer.component';
import { HorizontalNavigationComponent } from '../components/horizontal-navigation/horizontal-navigation.component';

@Component({
  imports: [RouterOutlet, HorizontalNavigationComponent, ArtificerComponent],
  standalone: true,
  selector: 'app-test-root',
  templateUrl: './test-app.component.html',
  styleUrls: ['./test-app.component.scss'],
})
export class TestAppComponent {
  title = 'taskorator';
  testing = false;
  authenticated = true;

  feedback = ''; // Change feedbacks array to a single string variable

  private feedbackSubscription: Subscription;
  // we init services here so their listeners are able to activate when necessary, because these services are kinda updated in background with eventBus
  constructor(
    // private serviceInitiator: ServiceInitiatorService,
    private errorService: ErrorService
  ) {
    this.feedbackSubscription = this.errorService
      .getFeedback()
      .subscribe((message) => {
        if (message) this.feedback = message; // Assign the new message to feedback
      });
  }

  async ngOnInit(): Promise<void> {
    // this.config.setTesting(true); // WE ARE TESTING HERE:
    // await this.serviceInitiator.waitForInitialization();
    // this.testing = this.config.isTesting();

    // this.authenticated = this.config.getAuthStrategy().isAuthenticated();
    console.log('Authenticated: ' + this.authenticated);
    // Proceed with the login process or other initialization tasks
  }
}
