import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RightMenuService {
  private isShowMoreEnabled: boolean = false;

  constructor() {}

  toggleShowMore(): void {
    this.isShowMoreEnabled = !this.isShowMoreEnabled;
  }

  // Optionally, you might want a method to check the current state from the component
  getIsShowMoreEnabled(): boolean {
    return this.isShowMoreEnabled;
  }

  // we will have permanent changes separate menu
  // this menu is just for quick changes
  //
  // constructor(private settingsService: SettingsService) {}

  // toggleShowMore() {
  //   this.settingsService
  //     .getSettings()
  //     .subscribe((settings) => {
  //       // Only update the setting once, do not subscribe to changes here
  //       if (settings) {
  //         settings.isShowMore = !settings.isShowMore;

  //         this.settingsService.updateSettings(settings);
  //       }
  //     })
  //     .unsubscribe(); // Unsubscribe immediately to prevent memory leaks or unintended repeated updates
  // }
}
