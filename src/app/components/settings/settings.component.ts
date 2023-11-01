import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
import { completeButtonColorMap } from 'src/app/task-model/colors';
import { CompleteButtonAction, Settings } from 'src/app/task-model/settings';

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

  // TODO: remove the filter options or not, decide
  // these should be inside filter service
  // ngOnInit(): void {
  //   this.settingsService.getSettings().subscribe((settings: Settings) => {
  //     this.settingsForm.setValue(settings);
  //   });
  // }

  ngOnInit(): void {
    // this.settingsService.getSettings().subscribe((settings: Settings) => {
    //   this.settingsForm.setValue(settings);
    // });

    // Automatically save settings when form values change
    this.settingsForm.valueChanges.subscribe((newSettings) => {
      this.settingsService.setSettings(newSettings);
    });
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
