import { Component, NgModule, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControlName,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { completeButtonColorMap } from '../../../../models/colors';
import {
  CompleteButtonAction,
  TaskSettings,
} from '../../../../models/settings';
import { SettingsService } from '../../../../services/core/settings.service';
import { getBaseTask } from '../../../../models/taskModelManager';
import { Task } from '../../../../models/taskModelManager';
import { MatDialog } from '@angular/material/dialog';
import { TaskEditPopupComponent } from '../../../../components/task/task-edit-popup/task-edit-popup.component';
import { TaskUpdateService } from '../../../../services/task/task-update.service';
import { TaskActions } from '../../../../services/tasks/task-action-tracker.service';
import { TaskMiniComponent } from '../../../../components/task/task-mini/task-mini.component';
import { TaskService } from '../../../../services/tasks/task.service';
import { AuthService } from '../../../../services/core/auth.service';
import { ApiFirebaseService } from '../../../../services/core/api-firebase.service';
import { TaskUserInfo } from '../../../../models/service-strategies/user';
import { TreeService } from '../../../../services/core/tree.service';
import { TaskTree } from '../../../../models/taskTree';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    NgClass,
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
  task: Task = getBaseTask();
  user: TaskUserInfo | null = null;
  tree: string | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private taskUpdateService: TaskUpdateService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private auth: AuthService,
    private apiService: ApiFirebaseService
  ) // private treeService: TreeService
  {
    this.settingsForm = this.fb.group({
      isShowArchived: [false],
      isShowCompleted: [false],
      isShowSeen: [true],
      isShowDeleted: [false],
      isShowTodo: [true],
      completeButtonAction: ['completed'],
    });
  }

  // Add a private member to control the save operation
  private isInitializingForm = true;

  ngOnInit(): void {
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
    this.auth.isAuthenticatedObservable().subscribe((b) => {
      if (!b) return;
      this.taskService.getTaskById(this.task.taskId).then((t) => {
        if (!t) return;
        this.task = t;
      });

      this.auth.getCurrentUserId().then((id) => {
        if (!id) return;
        this.apiService.getUserInfo(id).then((u) => {
          if (!u) return;
          this.user = u;
        });
      });
    });
  }

  editTask(t: Task) {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: t, // Pass the task to edit
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the task in your list or database
        if (result) {
          console.log('Task updated on server:', result);
          const taskAction: TaskActions = TaskActions.UPDATED;
          this.taskUpdateService.update(result, taskAction);
        }
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
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
