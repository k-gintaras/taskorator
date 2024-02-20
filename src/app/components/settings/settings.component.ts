import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
import { completeButtonColorMap } from 'src/app/models/colors';
import { CompleteButtonAction, Settings } from 'src/app/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
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
  currentSettings: Settings | undefined;

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
    this.settingsForm.valueChanges.subscribe((newFormValues) => {
      // Only save settings if we're not initializing the form
      if (!this.isInitializingForm) {
        //this.saveSettings(newFormValues);
      }
    });
  }

  private loadCurrentSettings(): void {
    this.settingsService.getSettings().subscribe((currentSettings) => {
      // Before patching the form, ensure we're in initialization mode
      this.isInitializingForm = true;

      // Populate form with current settings
      this.settingsForm.patchValue(currentSettings);

      // After the form is patched, we're no longer initializing
      setTimeout(() => (this.isInitializingForm = false), 0);

      // Store currentSettings for later use in merging
      this.currentSettings = currentSettings;
    });
  }

  private saveSettings(newFormValues: any): void {
    const newSettings: Settings = {
      ...this.currentSettings,
      ...newFormValues,
    };

    // Save the new, merged settings
    this.settingsService.saveSettings(newSettings);
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
