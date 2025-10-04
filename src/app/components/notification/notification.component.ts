import { Component, OnInit } from '@angular/core';
import { ErrorService } from '../../services/core/error.service';
import { TaskUiDecoratorService } from '../../services/tasks/task-list/task-ui-decorator.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { StatusIndicatorService, StatusState } from '../../services/status/status-indicator.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MatIcon, AsyncPipe],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  appTitle = 'Taskorator';
  message: string | null = null;
  feedbackUpdated = false;
  selectedTasksCount = 0;
  
  // Status indicator properties
  statusState$: Observable<StatusState>;
  showStatus$: Observable<boolean>;

  constructor(
    private errorService: ErrorService,
    private taskUiDecorator: TaskUiDecoratorService,
    private router: Router,
    private statusIndicatorService: StatusIndicatorService
  ) {
    // Initialize status observables
    this.statusState$ = this.statusIndicatorService.statusState$;
    this.showStatus$ = this.statusIndicatorService.showStatus$;
  }

  ngOnInit(): void {
    this.errorService.getFeedback().subscribe((s) => {
      if (s) {
        this.message = s;
        this.feedbackUpdated = true; // Trigger blinker
        setTimeout(() => (this.feedbackUpdated = false), 3000); // Stop blinking after 3 seconds
      }
    });

    // Subscribe to selected tasks changes
    this.taskUiDecorator.selectedTasksChanges$.subscribe((selectedTasks) => {
      this.selectedTasksCount = selectedTasks.length;
    });
  }

  toggleFeedbackView(): void {
    if (this.message) this.feedbackUpdated = !this.feedbackUpdated; // Clear the message on toggle
  }

  onNotificationClick(): void {
    if (this.hasSelectedTasks()) {
      // Navigate to selected tasks view
      this.router.navigate(['/crucible/selected']);
    } else {
      // Default behavior
      this.toggleFeedbackView();
    }
  }

  hasSelectedTasks(): boolean {
    return this.selectedTasksCount > 0;
  }

  getTruncatedMessage(): string {
    if (!this.message) return '';
    const maxLength = 50; // Adjust as needed
    return this.message.length > maxLength
      ? this.message.substring(0, maxLength) + '...'
      : this.message;
  }

  getNotificationTitle(): string {
    return this.appTitle;
    // return this.hasSelectedTasks() ? 'Selected Tasks' : this.appTitle;
  }

  /**
   * Toggle status indicator manually
   */
  toggleStatusIndicator(): void {
    this.statusIndicatorService.toggleStatus();
  }

  /**
   * Get CSS variable for status color
   */
  getStatusColor(color: string): string {
    return `var(${color})`;
  }

  /**
   * Check if status should be shown (either automatically or manually toggled)
   */
  shouldShowStatus(showStatus: boolean): boolean {
    return showStatus && !this.feedbackUpdated; // Don't show status when feedback is active
  }
}
