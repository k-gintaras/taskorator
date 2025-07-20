import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskSession } from '../task-session.model';
import { TaskSessionService } from '../services/task-session.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TaskUiInteractionService } from '../../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TaskNavigatorComponent,
  ],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit, OnDestroy {
  sessions: TaskSession[] = [];
  selectedTaskIds: string[] = [];
  selectedSession: TaskSession | null = null;
  remainingTime = 0;
  private timerWorker?: Worker;

  hours = 0;
  minutes = 0;
  seconds = 0;

  constructor(
    private taskSessionService: TaskSessionService,
    private taskUiInteractionService: TaskUiInteractionService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.selectedTaskIds = this.taskUiInteractionService.getSelectedTaskIds();
  }

  startSession(): void {
    if (!this.selectedSession) return;

    if (this.timerWorker) this.timerWorker.terminate();

    this.remainingTime = this.selectedSession.duration;

    if (typeof Worker !== 'undefined') {
      this.timerWorker = new Worker(new URL('./timer.worker', import.meta.url));
      this.timerWorker.onmessage = ({ data }) => {
        if (data.done) {
          this.playSound();
        } else {
          this.remainingTime = data.remainingTime;
        }
      };
      this.timerWorker.postMessage({ duration: this.selectedSession.duration });
    } else {
      console.error('Web Workers are not supported in this environment.');
    }
  }

  playSound(): void {
    const audio1 = new Audio('assets/end.wav');
    const audio2 = new Audio('assets/session.wav');
    const audio3 = new Audio('assets/over.wav');

    audio1.addEventListener('ended', () => audio2.play());
    audio2.addEventListener('ended', () => audio3.play());
    audio1.play();
  }

  ngOnDestroy(): void {
    if (this.timerWorker) this.timerWorker.terminate();
  }

  setNavigator(session: TaskSession) {
    this.selectedSession = session;
    // Navigation logic if needed
  }

  async loadSessions() {
    this.sessions = await this.taskSessionService.getSessions();
  }

  async createSession(
    name: string,
    hours: number,
    minutes: number,
    seconds: number
  ) {
    if (!name || (!hours && !minutes && !seconds)) {
      alert('Please provide a session name and duration.');
      return;
    }
    const duration = hours * 3600 + minutes * 60 + seconds;
    if (this.selectedTaskIds.length < 1) {
      console.log("Can't create empty session.");
      return;
    }
    if (name.length < 1) {
      console.log('Create name for a session.');
      return;
    }
    const newSession: TaskSession = {
      id: '',
      name,
      taskIds: this.selectedTaskIds,
      duration,
    };
    await this.taskSessionService.createSession(newSession);
    this.loadSessions();
  }

  async deleteSession(sessionId: string) {
    await this.taskSessionService.deleteSession(sessionId);
    this.loadSessions();
  }

  async updateSession(session: TaskSession) {
    await this.taskSessionService.updateSession(session);
    this.loadSessions();
  }

  convertSecondsToTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    if (hours > 0) return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    if (remainingMinutes > 0)
      return `${remainingMinutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  }
}
