import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { completeButtonColorMap } from '../../../../models/colors';
import {
  CompleteButtonAction,
  TaskSettings,
  getDefaultTaskSettings,
} from '../../../../models/settings';
import { SettingsService } from '../../../../services/sync-api-cache/settings.service';
import {
  getRootTaskObject,
  ROOT_TASK_ID,
} from '../../../../models/taskModelManager';
import { TaskoratorTask } from '../../../../models/taskModelManager';
import { MatDialog } from '@angular/material/dialog';
import { TaskEditPopupComponent } from '../../../../components/task/task-edit-popup/task-edit-popup.component';
import { TaskUpdateService } from '../../../../services/tasks/task-update.service';
import { TaskActions } from '../../../../services/tasks/task-action-tracker.service';
import { TaskMiniComponent } from '../../../../components/task/task-mini/task-mini.component';
import { TaskService } from '../../../../services/sync-api-cache/task.service';
import { TaskUserInfo } from '../../../../models/service-strategies/user';
import { SessionManagerService } from '../../../../services/session-manager.service';
import { RouteMetadata } from '../../../../app.routes-models';
import { Router } from '@angular/router';
import { NavigationService } from '../../../../services/navigation.service';
import { ThemeService, ThemeMode } from '../../../../services/core/theme.service';
import { AuthUser } from '../../../../models/service-strategies/auth-strategy.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    MatIcon,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    TaskMiniComponent,
  ],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  completeButtonActions: CompleteButtonAction[] = [
    'completed',
    'archived',
    'deleted',
    'seen',
    'todo',
  ];
  currentSettings: TaskSettings | undefined;
  task: TaskoratorTask = getRootTaskObject();
  user: TaskUserInfo | null = null;
  tree: string | null = null;

  navItems: { path: string; metadata: RouteMetadata }[] = [];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private taskUpdateService: TaskUpdateService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private sessionService: SessionManagerService,
    private navigationService: NavigationService,
    private router: Router,
    private themeService: ThemeService
  ) {
    // Initialize form with all settings including new preferences
    const defaults = getDefaultTaskSettings();
    this.settingsForm = this.fb.group({
      isShowArchived: [defaults.isShowArchived],
      isShowCompleted: [defaults.isShowCompleted],
      isShowSeen: [defaults.isShowSeen],
      isShowDeleted: [defaults.isShowDeleted],
      isShowTodo: [defaults.isShowTodo],
      completeButtonAction: [defaults.completeButtonAction],
      theme: [defaults.theme],
      sortOrder: [defaults.sortOrder],
      showArtificer: [defaults.showArtificer],
      showExtraControls: [defaults.showExtraControls],
    });

    // Listen for changes and save
    this.settingsForm.valueChanges.subscribe((newValues) => {
      if (!this.isInitializingForm) {
        // Apply theme immediately when changed
        if (newValues.theme) {
          this.themeService.setTheme(newValues.theme);
        }
        this.saveSettings(newValues);
      }
    });
  }

  onNavItemClick(item: { path: string; metadata: RouteMetadata }) {
    // const childrenPaths = this.navigationService.getChildrenPaths(item.path);

    // if (childrenPaths.length > 0) {
    //   this.router.navigate([item.path]);
    // } else {
    this.router.navigate(['gateway/' + item.path]);
    // }
  }

  // Add a private member to control the save operation
  private isInitializingForm = true;

  private saveSettings(values: TaskSettings) {
    // Merge currentSettings base with form values
    const updated: TaskSettings = { ...this.currentSettings, ...values } as TaskSettings;
    this.settingsService.updateSettings(updated).catch(console.error);
  }

  private loadCurrentSettings(): void {
    this.settingsService.getSettings().subscribe((settings) => {
      if (settings) {
        this.isInitializingForm = true;
        this.currentSettings = settings;
        // Patch form with loaded settings
        this.settingsForm.patchValue({
          isShowArchived: settings.isShowArchived,
          isShowCompleted: settings.isShowCompleted,
          isShowSeen: settings.isShowSeen,
          isShowDeleted: settings.isShowDeleted,
          isShowTodo: settings.isShowTodo,
          completeButtonAction: settings.completeButtonAction,
          theme: settings.theme,
          sortOrder: settings.sortOrder,
          showArtificer: settings.showArtificer,
          showExtraControls: settings.showExtraControls,
        });
        // Apply loaded theme to the app
        this.themeService.setTheme(settings.theme as ThemeMode);
        setTimeout(() => (this.isInitializingForm = false), 0);
      }
    });
  }

  async ngOnInit() {
    await this.sessionService.waitForInitialization();
    this.loadCurrentSettings();

    // TODO: replace with the correct auth
    this.getAuth()
      .getCurrentUser()
      .subscribe((u: AuthUser | null) => {
        if (!u) return;
        this.taskService.getTaskById(this.task.taskId).then((t) => {
          if (!t) return;
          this.task = t;
        });

        const userIdPromise = this.getAuth().getCurrentUserId();
        userIdPromise.then((id: string | undefined) => {
          if (!id) return;
          this.getApi()
            .getUserInfo()
            .then((u: TaskUserInfo | null) => {
              if (!u) return;
              this.user = u;
            });
        });
      });
    this.navItems = this.navigationService.getSettingsPaths();
  }

  getApi(): any {
    return this.sessionService.getApiStrategy();
  }
  
  /**
   * Get current Auth strategy
   */
  getAuth(): any {
    return this.sessionService.getAuthStrategy();
  }

  /**
   * Open edit dialog for a task
   */
  editTask(task: TaskoratorTask): void {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: task,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && typeof result === 'object') {
        const action: TaskActions = TaskActions.UPDATED;
        this.taskUpdateService.update(result, action);
      }
    });
  }

  /**
   * Save current task state (stub)
   */
  saveTask(task: TaskoratorTask): void {
    console.log('Saving task', task);
    // implement save logic if needed
  }

  // Add public handler for Save Settings button
  public onSaveSettings(): void {
    // Trigger settings save with current form values
    this.saveSettings(this.settingsForm.value);
  }
}
