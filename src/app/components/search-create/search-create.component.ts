import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
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
import { Router } from '@angular/router';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';

@Component({
  selector: 'app-search-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgForOf,
    NgIf,
    MatIcon,
  ],
  templateUrl: './search-create.component.html',
  styleUrls: ['./search-create.component.scss'],
})
export class SearchCreateComponent {
  @Input() isEnabledBack = false; // Or however you define this based on selection
  searchControl = new FormControl('');
  searchResults: TaskTreeNode[] = [];
  selectedOverlord: UiTask | null = this.taskTransmutationService.toUiTask(
    getRootTaskObject()
  );

  constructor(
    private taskupdateService: TaskUpdateService,
    private selectedOverlordService: SelectedOverlordService,
    private taskSearchService: SearchTasksService,
    private router: Router,
    private taskTransmutationService: TaskTransmutationService
  ) {}

  ngOnInit(): void {
    // Subscribe to input changes for search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query) return [];
          if (query.trim()) {
            return this.taskSearchService.searchTasks(query); // Fetch matching results
          }
          return []; // Return empty array for empty input
        })
      )
      .subscribe((tasks) => (this.searchResults = tasks));

    // Watch for selected overlord changes
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: UiTask | null) => {
        if (overlord) {
          this.selectedOverlord = overlord;
        }
      });
  }

  onSelectTask(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
    this.resetState();
  }

  onCreateTask(taskName: string): void {
    const trimmed = taskName.trim();
    if (!trimmed) {
      console.error('Task name cannot be empty.');
      return;
    }

    const task: TaskoratorTask = {
      ...getDefaultTask(),
      name: trimmed,
      overlord: this.selectedOverlord?.taskId || ROOT_TASK_ID,
    };

    this.taskupdateService.create(task);
    setTimeout(() => this.resetState(), 1000);
  }

  // /**
  //  * Handles creating a new task with the input value.
  //  */
  // onCreateTask(taskName: string | null): void {
  //   if (!taskName) return;
  //   if (!taskName.trim()) {
  //     console.error('Task name cannot be empty.');
  //     return;
  //   }

  //   const task: TaskoratorTask = {
  //     ...getDefaultTask(),
  //     name: taskName.trim(),
  //     overlord: this.selectedOverlord?.taskId || ROOT_TASK_ID,
  //   };

  //   this.taskupdateService.create(task); //.then(() => {
  //   this.resetState();
  //   // });
  // }

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
  }

  goToSelectedTask() {}

  goBack(): void {
    if (!this.selectedOverlord) return;
    // TODO: can go back in searchcreate???
  }
}
