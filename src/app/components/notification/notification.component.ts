import { Component, OnInit } from '@angular/core';
import { ErrorService } from '../../services/core/error.service';


@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  appTitle = 'Taskorator';
  message: string | null = null;
  feedbackUpdated = false;

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorService.getFeedback().subscribe((s) => {
      if (s) {
        this.message = s;
        this.feedbackUpdated = true; // Trigger blinker
        setTimeout(() => (this.feedbackUpdated = false), 3000); // Stop blinking after 3 seconds
      }
    });
  }

  toggleFeedbackView(): void {
    if (this.message) this.feedbackUpdated = !this.feedbackUpdated; // Clear the message on toggle
  }
}
