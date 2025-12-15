import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExtraActionsService } from '../../services/extra-actions.service';
import { TaskListDataFacadeService } from '../../services/tasks/task-list/task-list-data-facade.service';
import { TaskSettings } from '../../models/settings';
import { SettingsService } from '../../services/sync-api-cache/settings.service';
import { ThemeMode } from '../../services/core/theme.service';
import { SortMode, TaskListOrganizationService } from '../../services/tasks/task-list/task-list-organization.service';
import { NavigationDrawerService } from '../../services/navigation-drawer.service';

@Component({
  selector: 'app-extra-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './extra-actions.component.html',
  styleUrls: ['./extra-actions.component.scss'],
})
export class ExtraActionsComponent implements OnInit {
  currentTheme: ThemeMode;
  currentSort: SortMode;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  constructor(
    public extraActionsService: ExtraActionsService,
    private settingsService: SettingsService,
    private taskListFacade: TaskListDataFacadeService,
    private orgService: TaskListOrganizationService,
    private navigationDrawerService: NavigationDrawerService
  ) {
    this.currentTheme = this.extraActionsService.getCurrentTheme();
    this.currentSort = 'rules'; // default to rules-based sorting
  }
  ngOnInit() {
    // Reflect persisted settings theme
    this.settingsService.getSettings().subscribe(settings => {
      if (settings && settings.theme) {
        this.currentTheme = settings.theme as ThemeMode;
      }
    });
    // Sync sort mode and direction from organization service
    this.orgService.organizationState$.subscribe(state => {
      this.currentSort = state.sortMode;
      this.sortDirection = state.sortDirection;
    });
  }

  /** Change task list sort order */
  changeSort(order: SortMode): void {
    this.currentSort = order;
    
    // Apply sorting through the facade
    if (order === 'rules') {
      this.taskListFacade.resetSortToDefault();
    } else {
      this.taskListFacade.sortCurrentTasks(order as any);
    }
    
    // Persist to settings (convert 'rules' to 'custom' for settings compatibility)
    const settingsOrder = order === 'rules' ? 'custom' : order;
    this.settingsService.getSettingsOnce()
      .then(settings => {
        if (settings) {
          const updated = { ...settings, sortOrder: settingsOrder } as any;
          this.settingsService.updateSettings(updated).catch(console.error);
        }
      })
      .catch(console.error);
    
    // Close the navigation drawer on mobile when a sort option is selected
    this.navigationDrawerService.requestDrawerClose();
  }

  /** Reset to default rules-based sorting */
  resetToDefaultSort(): void {
    this.changeSort('rules');
  }

  /** Check if current sort is the default */
  isDefaultSort(): boolean {
    return this.currentSort === 'rules';
  }

  /** Get available sort options */
  getAvailableSorts(): SortMode[] {
    return this.taskListFacade.getAvailableSortModes();
  }

  /** Toggle theme and close drawer on mobile */
  toggleTheme(): void {
    this.extraActionsService.toggleTheme();
    // Close the navigation drawer on mobile when theme is toggled
    this.navigationDrawerService.requestDrawerClose();
  }
}
