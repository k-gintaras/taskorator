import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskSession } from '../task-session.model';
import { TaskSessionDialogComponent } from '../task-session-dialog/task-session-dialog.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskSessionService } from '../services/task-session.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import { SimpleNavigatorComponent } from '../../task-navigator/simple-navigator/simple-navigator.component';
import { TaskNavigatorUltraService } from '../../task-navigator/services/task-navigator-ultra.service';
import { getBaseTask, Task } from '../../../models/taskModelManager';
import { TaskListService } from '../../../services/task/task-list/task-list.service';

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
    SimpleNavigatorComponent,
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
      .getTasksFromIds(session.taskIds)
      .then((tasks: Task[] | null) => {
        if (!tasks) return;
        const overlord = getBaseTask(); // just let it be base task, which is root task
        overlord.name = 'Root Tasks';
        overlord.why = '';
        overlord.todo = '';
        this.navigatorService.setInitialTasks(overlord, tasks);
        this.navigatorService.setTaskNavigationView(overlord, tasks);
      });
  }

  async loadSessions() {
    this.sessions = await this.taskSessionService.getSessions();
  }

  async createSession(name: string, durationString: string) {
    let duration = 0;
    try {
      duration = parseInt(durationString);
    } catch (error) {
      console.log('Session duration must be a number.');
      return;
    }

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
}
