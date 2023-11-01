import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
import { CompleteButtonAction, Settings } from 'src/app/task-model/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  completeButtonActions: CompleteButtonAction[] = [
    'complete',
    'archive',
    'delete',
    'refresh',
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.settingsForm = this.fb.group({
      isShowArchived: [false],
      isShowCompleted: [false],
      completeButtonAction: ['complete'],
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

  // saveSettings() {
  //   this.settingsService.setSettings(this.settingsForm.value);
  // }
}
