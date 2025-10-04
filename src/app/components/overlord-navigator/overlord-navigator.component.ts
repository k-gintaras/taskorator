import { Component, Input, HostListener, ElementRef, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  UiTask,
  getDefaultTask,
  getRootTaskObject,
  ROOT_TASK_ID,
  TaskoratorTask,
} from '../../models/taskModelManager';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { SearchTasksService } from '../../services/tasks/search-tasks.service';
import { TaskTreeNode } from '../../models/taskTree';
import { MatIcon } from '@angular/material/icon';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';
import { TaskUtilityService } from '../../services/tasks/task-utility.service';

/**
 * Overlord Navigator - Search and select overlord tasks
 */
@Component({
  selector: 'app-overlord-navigator',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon
],
  templateUrl: './overlord-navigator.component.html',
  styleUrls: ['./overlord-navigator.component.scss'],
})
export class OverlordNavigatorComponent implements OnInit {
  @Input() isEnabledBack = false;
  searchControl = new FormControl('');
  searchResults: TaskTreeNode[] = [];
  selectedOverlord: UiTask | null = null;
  isDropdownOpen = false;

  constructor(
    private taskupdateService: TaskUpdateService,
    private selectedOverlordService: SelectedOverlordService,
    private taskSearchService: SearchTasksService,
    private taskTransmutationService: TaskTransmutationService,
    private taskUtilityService: TaskUtilityService,
    private elementRef: ElementRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Ensure we always have root task selected by default
    const currentOverlord = this.selectedOverlordService.getSelectedOverlord();
    if (!currentOverlord) {
      await this.selectedOverlordService.setSelectedOverlordById(ROOT_TASK_ID);
    }

    // Subscribe to input changes for search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query) return [];
          if (query.trim()) {
            return this.taskSearchService.searchTasks(query);
          }
          return [];
        })
      )
      .subscribe((tasks) => {
        this.searchResults = tasks;
        this.isDropdownOpen = tasks.length > 0;
      });

    // Watch for selected overlord changes
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: UiTask | null) => {
        this.selectedOverlord = overlord;
      });
  }

  async onSelectTask(taskId: string): Promise<void> {
    await this.selectedOverlordService.setSelectedOverlordById(taskId);
    this.resetState();
  }

  onInputFocus(): void {
    if (this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Clears input and search results.
   */
  clearInput(): void {
    this.resetState();
  }

  /**
   * Resets input and results to initial state.
   */
  private resetState(): void {
    this.searchControl.reset();
    this.searchResults = [];
    this.isDropdownOpen = false;
  }

  goBack(): void {
    // Could implement navigation history if needed
  }
}
