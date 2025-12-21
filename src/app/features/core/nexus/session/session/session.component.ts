import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskSession } from '../task-session.model';
import { TaskSessionService } from '../services/task-session.service';
import { NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskUiInteractionService } from '../../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskListCoordinatorService } from '../../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskListDataFacadeService } from '../../../../../services/tasks/task-list/task-list-data-facade.service';
import { ErrorService } from '../../../../../services/core/error.service';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { TaskNavigatorComponent } from '../../../../../components/task-navigator/task-navigator.component';
import { TaskoratorTask } from '../../../../../models/taskModelManager';
import { TaskSessionRunnerService } from '../services/task-session-runner.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    NgIf,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    StagedTaskListComponent,
    TaskNavigatorComponent
],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit, OnDestroy {
  sessions: TaskSession[] = [];
  selectedTaskIds: string[] = [];
  selectedSession: TaskSession | null = null;
  runningSessionId: string | null = null;
  remainingTime = 0;
  private _prevRemaining = 0;
  private subs = new Subscription();

  sessionName = '';
  editMode = false;
  currentRunTaskCount = 0;

  selectedTasks: TaskoratorTask[] = [];

  hours = 0;
  minutes = 0;
  seconds = 0;

  constructor(
    private taskSessionService: TaskSessionService,
    private taskUiInteractionService: TaskUiInteractionService,
    private taskListCoordinator: TaskListCoordinatorService,
    private taskListDataFacade: TaskListDataFacadeService,
    private errorService: ErrorService,
    private runner: TaskSessionRunnerService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.selectedTaskIds = this.taskUiInteractionService.getSelectedTaskIds();
    this.loadSelectedTasks();
    // subscribe to runner observables so component updates on navigation
    this.subs.add(
      this.runner.remainingTime$.subscribe((t) => {
        if (this._prevRemaining > 0 && t === 0) {
          this.playSound();
        }
        this._prevRemaining = t;
        this.remainingTime = t;
      })
    );
    this.subs.add(
      this.runner.runningSession$.subscribe((s) => {
        this.runningSessionId = s?.id ?? null;
        if (!s) {
          this.selectedSession = null;
          return;
        }
        // if we already have loaded sessions, map to the fresh instance by id
        if (this.sessions && this.sessions.length) {
          const match = this.sessions.find((x) => x.id === s.id);
          this.selectedSession = match ?? s;
        } else {
          this.selectedSession = s;
        }
      })
    );
  }

  private async loadSelectedTasks(): Promise<void> {
    if (!this.selectedTaskIds || !this.selectedTaskIds.length) {
      this.selectedTasks = [];
      return;
    }
    this.selectedTasks = await this.taskListCoordinator.getTasksByIds(this.selectedTaskIds);
  }

  onStagedTasksChange(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks;
    this.selectedTaskIds = updatedTasks.map((t) => t.taskId);
  }

  startSession(useSelectedTasks = false): void {
    if (!this.selectedSession) return;

    // If requested and we have selected tasks, prefer those over session.taskIds
    let runTaskIds: string[] = [];
    if (useSelectedTasks && this.selectedTaskIds?.length) {
      runTaskIds = this.selectedTaskIds;
      this.currentRunTaskCount = this.selectedTaskIds.length;
    } else {
      runTaskIds = this.selectedSession.taskIds || [];
      this.currentRunTaskCount = runTaskIds.length ?? 0;
    }

    // Preload tasks into the global task navigator so user can navigate while running
    if (runTaskIds.length) {
      this.taskListCoordinator.getTasksByIds(runTaskIds).then((tasks) => {
        this.taskListDataFacade.setTasks(tasks);
      });
    } else {
      this.taskListDataFacade.setTasks([]);
    }

    // delegate timer control to runner service so it survives navigation
    this.runner.start(this.selectedSession);
  }

  stopSession(): void {
    this.runner.stop();
    this.currentRunTaskCount = 0;
    this.remainingTime = 0;
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
    this.subs.unsubscribe();
  }

  setNavigator(session: TaskSession) {
    this.selectedSession = session;
    // preload tasks associated with this session
    const ids = session.taskIds || [];
    this.selectedTaskIds = ids;
    if (ids.length) {
      this.taskListCoordinator.getTasksByIds(ids).then((tasks) => {
        this.selectedTasks = tasks || [];
        // push tasks into navigator so user can run/see them
        this.taskListDataFacade.setTasks(this.selectedTasks as any);
      });
    } else {
      this.selectedTasks = [];
    }
  }

  beginEdit(session: TaskSession) {
    this.selectedSession = session;
    this.sessionName = session.name;
    const hrs = Math.floor(session.duration / 3600);
    const mins = Math.floor((session.duration % 3600) / 60);
    const secs = session.duration % 60;
    this.hours = hrs;
    this.minutes = mins;
    this.seconds = secs;
    this.editMode = true;
  }

  cancelEdit() {
    this.selectedSession = null;
    this.sessionName = '';
    this.hours = this.minutes = this.seconds = 0;
    this.editMode = false;
  }

  async loadSessions() {
    this.sessions = await this.taskSessionService.getSessions();
    // If a session is currently running in the runner, map to the newly-loaded instance
    const runningId = this.runner.runningSessionId;
    if (runningId) {
      const match = this.sessions.find((s) => s.id === runningId);
      if (match) {
        this.selectedSession = match;
      }
    }
  }

  async createSession() {
    const name = this.sessionName;
    const hours = this.hours;
    const minutes = this.minutes;
    const seconds = this.seconds;
    if (!name || (!hours && !minutes && !seconds)) {
      alert('Please provide a session name and duration.');
      return;
    }
    const duration = hours * 3600 + minutes * 60 + seconds;
    // Allow sessions without tasks (e.g., THINK mode). Use selectedTaskIds if present.
    if (name.length < 1) {
      console.log('Create name for a session.');
      return;
    }
    if (this.editMode && this.selectedSession) {
      const updated: TaskSession = {
        ...this.selectedSession,
        name,
        duration,
        taskIds: this.selectedTaskIds,
      };
      await this.taskSessionService.updateSession(updated);
      this.cancelEdit();
      this.errorService.popup('Session updated');
    } else {
      const newSession: TaskSession = {
        id: '',
        name,
        taskIds: this.selectedTaskIds,
        duration,
      };
      await this.taskSessionService.createSession(newSession);
      // clear create form
      this.sessionName = '';
      this.hours = this.minutes = this.seconds = 0;
      this.errorService.popup('Session created');
    }
    await this.loadSessions();
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
