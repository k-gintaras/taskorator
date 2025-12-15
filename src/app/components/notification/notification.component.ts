export interface NotificationUiState {
  icon: string;
  label: string;
  colorVar: string;   // e.g. '--error', '--purple-primary'
  pulse: boolean;
  click: 'feedback' | 'selected' | 'status' | 'idle';
}

import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { ErrorService } from '../../services/core/error.service';
import { TaskUiDecoratorService } from '../../services/tasks/task-list/task-ui-decorator.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StatusIndicatorService, StatusState } from '../../services/status/status-indicator.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { OTHER_CONFIG } from '../../app.config';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MatIcon, CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  appTitle = OTHER_CONFIG.APP_TITLE || 'Taskorator';

  message: string | null = null;
  selectedTasksCount = 0;
  statusState: StatusState | null = null;

  uiState: NotificationUiState = {
    icon: 'task_alt',
    label: this.appTitle,
    colorVar: '--text-secondary',
    pulse: false,
    click: 'idle',
  };

  constructor(
    private errorService: ErrorService,
    private taskUiDecorator: TaskUiDecoratorService,
    private router: Router,
    private statusIndicatorService: StatusIndicatorService
  ) {}

  ngOnInit(): void {
    const feedback$ = this.errorService.getFeedback().pipe(startWith<string | null>(null));
    const selected$ = this.taskUiDecorator.selectedTasksChanges$.pipe(startWith([]));
    const status$ = this.statusIndicatorService.statusState$.pipe(startWith<StatusState | null>(null));

    combineLatest([feedback$, selected$, status$]).subscribe(([feedback, selected, status]) => {
      this.message = feedback;
      this.selectedTasksCount = selected.length;
      this.statusState = status;
      this.uiState = this.computeUiState();
    });
  }

  private computeUiState(): NotificationUiState {
    // 1) Feedback / last action
    if (this.message) {
      return {
        icon: 'info',
        label: this.getTruncatedMessage(),
        colorVar: '--topbar-text',
        pulse: false,
        click: 'feedback',
      };
    }

    // 2) Selected tasks
    if (this.selectedTasksCount > 0) {
      return {
        icon: 'check_box',
        label: `${this.selectedTasksCount} selected`,
        colorVar: '--purple-primary',
        pulse: false,
        click: 'selected',
      };
    }

    // 3) Status (online/offline/auth/etc.)
    if (this.statusState) {
      return {
        icon: this.statusState.icon,
        label: this.statusState.message,
        colorVar: this.statusState.color, // e.g. '--success', '--warning', '--error'
        pulse: false, // Status doesn't pulse
        click: 'status',
      };
    }

    // 4) Idle / title
    return {
      icon: 'task_alt',
      label: this.appTitle,
      colorVar: '--text-secondary',
      pulse: false,
      click: 'idle',
    };
  }

  private getTruncatedMessage(): string {
    if (!this.message) return '';
    const maxLength = 50;
    return this.message.length > maxLength
      ? this.message.substring(0, maxLength) + '…'
      : this.message;
  }

  onClick(): void {
    switch (this.uiState.click) {
      case 'feedback':
        // Navigate to last action viewer
        this.router.navigate(['/dreamforge/lastAction']);
        break;
      case 'selected':
        this.router.navigate(['/crucible/selected']);
        break;
      case 'status':
        this.statusIndicatorService.toggleStatus();
        break;
      case 'idle':
      default:
        // maybe open "About / Version / Logs" later if you want
        break;
    }
  }

  getColor(varName: string): string {
    return `var(${varName})`;
  }
}
