import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtraActionsService } from '../../services/extra-actions.service';
import { TaskListDataFacadeService } from '../../services/tasks/task-list/task-list-data-facade.service';
import { TaskSettings } from '../../models/settings';
import { SettingsService } from '../../services/sync-api-cache/settings.service';
import { ThemeMode } from '../../services/core/theme.service';

@Component({
  selector: 'app-extra-actions',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './extra-actions.component.html',
  styleUrls: ['./extra-actions.component.scss'],
})
export class ExtraActionsComponent implements OnInit {
  currentTheme: ThemeMode;
  currentSort: 'date' | 'priority';
  constructor(
    public extraActionsService: ExtraActionsService,
    private settingsService: SettingsService,
    private taskListFacade: TaskListDataFacadeService
  ) {
    this.currentTheme = this.extraActionsService.getCurrentTheme();
    this.currentSort = 'priority'; // default
  }
  ngOnInit() {
    // Reflect persisted settings theme
    this.settingsService.getSettings().subscribe(settings => {
      if (settings) {
        if (settings.theme) this.currentTheme = settings.theme as ThemeMode;
        // Only apply valid sort orders
        if (settings.sortOrder === 'date' || settings.sortOrder === 'priority') {
          this.currentSort = settings.sortOrder;
        }
      }
    });
  }

  /** Change task list sort order */
  changeSort(order: 'date' | 'priority'): void {
    this.currentSort = order;
    // Apply sorting to the current list
    this.taskListFacade.sortCurrentTasks(order);
    // Persist to settings
    this.settingsService.getSettingsOnce()
      .then(settings => {
        if (settings) {
          const updated = { ...settings, sortOrder: order } as any;
          this.settingsService.updateSettings(updated).catch(console.error);
        }
      })
      .catch(console.error);
  }
}
