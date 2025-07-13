import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  ExtendedTask,
  getRootTaskObject,
  TaskoratorTask,
} from '../../models/taskModelManager';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { SearchTasksService } from '../../services/tasks/search-tasks.service';
import { TaskTreeNode } from '../../models/taskTree';
import { MatIcon } from '@angular/material/icon';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';

@Component({
  selector: 'app-search-create-test',
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
export class SearchCreateTestComponent {
  isEnabledBack = false;
  searchControl = new FormControl('');
  searchResults: TaskTreeNode[] = [];
  selectedOverlord: ExtendedTask | null = {
    isVisible: true,
    animationState: 'normal',
    ...getRootTaskObject(),
  };

  constructor(
    private selectedOverlordService: SelectedOverlordService,
    private navigatorService: TaskNavigatorService,
    private taskSearchService: SearchTasksService
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
    this.selectedOverlordService;
    // .getSelectedOverlordObservable()
    // .subscribe((taskId: string | null) => {
    //   if (!taskId) return;
    //   // this.taskService.getTaskById(taskId).then((task) => {
    //   //   if (!task) return;
    //   //   console.log('getting task named: ' + task.name);
    //   //   console.log('getting task: ');
    //   //   this.selectedOverlord = task;
    //   // });
    // });
  }

  /**
   * Handles task selection from search results.
   */
  onSelectTask(taskId: string): void {
    // this.selectedOverlordService.setSelectedOverlord(taskId); // Select task as overlord

    this.navigatorService.navigateInToTask(taskId); // Navigate to task details
    this.resetState();
  }

  /**
   * Handles creating a new task with the input value.
   */
  onCreateTask(taskName: string): void {
    if (!taskName.trim()) {
      console.error('Task name cannot be empty.');
      return;
    }

    const task: TaskoratorTask = {
      ...getRootTaskObject(),
      name: taskName.trim(),
      overlord: this.selectedOverlord?.taskId || null,
    };

    // this.taskService.createTask(task).then(() => {
    //   this.resetState();
    // });
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
  }
  goBack(): void {
    if (!this.selectedOverlord) return;
    // TODO: can go back in searchcreate???
  }
}
