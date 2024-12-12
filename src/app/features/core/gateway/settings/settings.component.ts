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

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [NgClass, MatIcon, MatCardModule, CommonModule, ReactiveFormsModule],
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

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
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
  }

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
