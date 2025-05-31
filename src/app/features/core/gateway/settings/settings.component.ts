import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { completeButtonColorMap } from '../../../../models/colors';
import {
  CompleteButtonAction,
  TaskSettings,
} from '../../../../models/settings';
import { SettingsService } from '../../../../services/sync-api-cache/settings.service';
import {
  getRootTaskObject,
  ROOT_TASK_ID,
} from '../../../../models/taskModelManager';
import { Task } from '../../../../models/taskModelManager';
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

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
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
  task: Task = getRootTaskObject();
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
    private sessionManager: SessionManagerService
  ) {
    this.settingsForm = this.fb.group({
      isShowArchived: [false],
      isShowCompleted: [false],
      isShowSeen: [true],
      isShowDeleted: [false],
      isShowTodo: [true],
      completeButtonAction: ['completed'],
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

  async ngOnInit() {
    // await this.sessionManager.waitForInitialization();

    // this.loadCurrentSettings();

    // Subscribe to form value changes with additional logic to prevent loop
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.settingsForm.valueChanges.subscribe((newFormValues) => {
      // Only save settings if we're not initializing the form
      if (!this.isInitializingForm) {
        //this.saveSettings(newFormValues);
      }
    });
    // this.treeService.getTree().subscribe((t) => {
    //   if (!t) return;
    //   this.tree = JSON.stringify(t, null, 2);
    // });

    // TODO: replace with the correct auth
    this.getAuth()
      .getCurrentUser()
      .subscribe((u) => {
        if (!u) return;
        this.taskService.getTaskById(this.task.taskId).then((t) => {
          if (!t) return;
          this.task = t;
        });

        const userId = this.getAuth().getCurrentUserId();
        if (!userId) return;
        this.getApi()
          .getUserInfo()
          .then((u) => {
            if (!u) return;
            this.user = u;
          });
      });
    this.navItems = this.navigationService.getSettingsPaths();
  }

  getApi() {
    return this.sessionService.getApiStrategy();
  }

  getAuth() {
    return this.sessionService.getAuthStrategy();
  }

  editTask(t: Task) {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: t, // Pass the task to edit
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the task in your list or database
        if (typeof result === 'object') {
          console.log('Task updated on server:', result);
          const taskAction: TaskActions = TaskActions.UPDATED;
          const canUpdate = this.isUpdateValid(result);
          if (canUpdate) this.taskUpdateService.update(result, taskAction);
        }
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  isUpdateValid(task: Task): boolean {
    if (task.taskId === ROOT_TASK_ID) {
      // Rule 1: Root task must never be marked as !completed
      if (task.stage !== 'completed') {
        console.error('Root task must always be completed.');
        return false;
      }

      // Rule 3: Root task repeat can only be "once" or "never"
      if (task.repeat && task.repeat !== 'once' && task.repeat !== 'never') {
        console.error('Root task repeat can only be "once" or "never".');
        return false;
      }
    }

    // Add further validations for non-root tasks if needed

    return true; // All validations passed
  }
  saveTask(t: Task) {}

  private loadCurrentSettings(): void {
    this.settingsService.getSettings().subscribe((currentSettings) => {
      if (currentSettings) {
        // Before patching the form, ensure we're in initialization mode
        this.isInitializingForm = true;

        // Populate form with current settings
        this.settingsForm.patchValue(currentSettings);

        // After the form is patched, we're no longer initializing
        setTimeout(() => (this.isInitializingForm = false), 0);

        // Store currentSettings for later use in merging
        this.currentSettings = currentSettings;
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private saveSettings(newFormValues: any): void {
    const newSettings: TaskSettings = {
      ...this.currentSettings,
      ...newFormValues,
    };

    // Save the new, merged settings
    this.settingsService.updateSettings(newSettings);
  }

  // Add to your existing form or component class

  // TypeScript will no longer complain about potential null values
  setAction(action: string) {
    this.settingsForm.get('completeButtonAction')?.setValue(action);
  }

  getColor() {
    const c = this.settingsForm.get('completeButtonAction')?.value;
    return this.getButtonColor(c);
  }

  isActionSelected(action: string): boolean {
    return this.settingsForm.get('completeButtonAction')?.value === action;
  }

  getButtonColor(action: CompleteButtonAction): string {
    return completeButtonColorMap[action] || 'black';
  }

  // saveSettings() {
  //   this.settingsService.setSettings(this.settingsForm.value);
  // }
}
