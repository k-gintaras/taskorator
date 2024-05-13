import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  constructor() {}

  // addFocusTask(taskId: string): void {
  //   if (!this.settings.focusTaskIds.includes(taskId)) {
  //     this.updateSettings({
  //       focusTaskIds: [...this.settings.focusTaskIds, taskId],
  //     });
  //   }
  // }

  // updateSettings(updatedFields: Partial<TaskSettings>): void {
  //   this.settings = { ...this.settings, ...updatedFields };
  //   this.settingsService.updateSettings(this.settings);
  // }

  // removeFocusTask(taskId: string): void {
  //   this.updateSettings({
  //     focusTaskIds: this.settings.focusTaskIds.filter((id) => id !== taskId),
  //   });
  // }
}
