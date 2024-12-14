import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskSession } from '../task-session.model';
import { TaskSessionService } from '../services/task-session.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Task } from '../../../../../models/taskModelManager';
import { SelectedMultipleService } from '../../../../../services/task/selected-multiple.service';
import { TaskListService } from '../../../../../services/tasks/task-list.service';
import { TaskNavigatorUltraService } from '../../../../../services/tasks/task-navigator-ultra.service';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import {
  TaskListKey,
  TaskListType,
} from '../../../../../models/task-list-model';

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
  styleUrl: './session.component.scss',
})
export class SessionComponent implements OnInit, OnDestroy {
  sessions: TaskSession[] = [];
  selectedTaskIds: string[] = [];
  selectedSession: TaskSession | null = null;
  remainingTime = 0;
  private timerInterval: any;
  private timerWorker: Worker | undefined;

  // Variables to collect hours, minutes, and seconds
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  constructor(
    private taskSessionService: TaskSessionService,
    private selectedMultipleService: SelectedMultipleService,
    private navigatorService: TaskNavigatorUltraService,
    private taskListService: TaskListService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.selectedMultipleService
      .getSelectedTasks()
      .pipe(
        take(1), // take one value and complete
        map((tasks) => tasks.map((task) => task.taskId))
      )
      .subscribe((taskIds) => (this.selectedTaskIds = taskIds));
  }

  startSession(): void {
    if (!this.selectedSession) return;

    // Terminate any existing worker
    if (this.timerWorker) {
      this.timerWorker.terminate();
    }

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
      // Web Workers are not supported
      console.error('Web Workers are not supported in this environment.');
    }
  }

  playSound(): void {
    const audio1 = new Audio('assets/end.wav');
    const audio2 = new Audio('assets/session.wav');
    const audio3 = new Audio('assets/over.wav');

    // Play audio2 when audio1 ends
    audio1.addEventListener('ended', () => {
      audio2.play();
    });

    // Play audio3 when audio2 ends
    audio2.addEventListener('ended', () => {
      audio3.play();
    });

    // Start by playing audio1
    audio1.play();
  }

  ngOnDestroy(): void {
    if (this.timerWorker) {
      this.timerWorker.terminate();
    }
  }

  setNavigator(session: TaskSession) {
    this.selectedSession = session; // Set the selected session

    this.taskListService
      .getTasks(session.taskIds)
      .then((tasks: Task[] | null) => {
        if (!tasks) return;
        const taskListKey: TaskListKey = {
          type: TaskListType.SESSION,
          data: session.name,
        };
        this.navigatorService.loadAndInitializeTasks(tasks, taskListKey);
      });
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

    // Calculate the total duration in seconds
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
      id: '', // This will be generated on the backend or Firestore
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

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    } else if (remainingMinutes > 0) {
      return `${remainingMinutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}
