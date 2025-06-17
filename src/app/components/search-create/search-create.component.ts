import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  ExtendedTask,
  getDefaultTask,
  getRootTaskObject,
  ROOT_TASK_ID,
  TaskoratorTask,
} from '../../models/taskModelManager';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { SearchTasksService } from '../../services/tasks/search-tasks.service';
import { TaskTreeNode } from '../../models/taskTree';
import { MatIcon } from '@angular/material/icon';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigator-ultra.service';
import { Router } from '@angular/router';

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
  searchControl = new FormControl('');
  searchResults: TaskTreeNode[] = [];
  selectedOverlord: ExtendedTask | null = {
    isVisible: true,
    animationState: 'normal',
    ...getRootTaskObject(),
  };

  constructor(
    private taskService: TaskService,
    private taskupdateService: TaskUpdateService,
    private selectedOverlordService: SelectedOverlordService,
    private taskSearchService: SearchTasksService,
    private taskNavigator: TaskNavigatorUltraService,
    private router: Router
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
      .subscribe((taskId: string | null) => {
        if (!taskId) return;
        this.taskService.getTaskById(taskId).then((task) => {
          if (!task) return;
          this.selectedOverlord = task;
        });
      });
  }

  // onSelectTask(task: TaskTreeNode): void {
  //   this.selectedOverlordService.setSelectedOverlord(task.taskId); // Select task as overlord
  //   this.navigatorService.next(task.taskId);
  //   this.resetState();
  // }

  onSelectTask(task: TaskTreeNode): void {
    this.router.navigate(['/tasks', task.taskId]);
    this.resetState();
  }

  /**
   * Handles creating a new task with the input value.
   */
  onCreateTask(taskName: string | null): void {
    if (!taskName) return;
    if (!taskName.trim()) {
      console.error('Task name cannot be empty.');
      return;
    }

    const task: TaskoratorTask = {
      ...getDefaultTask(),
      name: taskName.trim(),
      overlord: this.selectedOverlord?.taskId || ROOT_TASK_ID,
    };

    this.taskupdateService.create(task); //.then(() => {
    this.resetState();
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

  goToSelectedTask() {}

  goBack(): void {
    if (!this.selectedOverlord) return;
    this.taskNavigator.backToPrevious();
  }
}
