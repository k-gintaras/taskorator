import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { map, Observable, startWith } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskoratorTask, UiTask } from '../../models/taskModelManager';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../services/tree/task-tree-node-tools.service';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TaskCacheService } from '../../services/cache/task-cache.service';

/**
 * @deprecated no point to search overlord, we just search tasks
 */
@Component({
  selector: 'app-search-overlord',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatButtonModule,
  ],
  templateUrl: './search-overlord.component.html',
  styleUrl: './search-overlord.component.scss',
})
export class SearchOverlordComponent implements OnInit {
  filteredTaskOptions: Observable<TaskTreeNode[] | null> | null = null;
  selectedOverlordId = '';
  taskSearchCtrl: FormControl = new FormControl();
  selectedOverlord: UiTask | null = null;

  taskOptions: TaskTreeNode[] = [];

  constructor(
    private treeService: TreeService,
    private treeNodeToolsService: TaskTreeNodeToolsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private taskTransmutationService: TaskTransmutationService,
    private router: Router,
    private taskCache: TaskCacheService
  ) {}

  ngOnInit() {
    this.selectedOverlordService.getSelectedOverlordObservable().subscribe((overlord) => {
      this.selectedOverlord = overlord;
    });

    this.loadTaskOptions();

    this.filteredTaskOptions = this.taskSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTasks(value || ''))
    );
  }

  loadTaskOptions() {
    this.treeService.getTree().subscribe((helperTree) => {
      if (helperTree) {
        this.taskOptions = this.treeNodeToolsService.getFlattened(helperTree);
      } else {
        // The helper tree can legitimately lag or be unavailable after reload.
        // Fall back to tasks currently present in cache so search still works
        // for the active working set.
        this.taskOptions = this.taskCache.getAllTasks().map((task) => ({
          taskId: task.taskId,
          name: task.name,
          overlord: task.overlord,
          children: [],
          childrenCount: 0,
          completedChildrenCount: 0,
          connected: false,
          stage: task.stage,
        }));
      }

      this.taskSearchCtrl.setValue(this.taskSearchCtrl.value || '');
    });
  }

  filterTasks(value: string): TaskTreeNode[] {
    if (!this.taskOptions || this.taskOptions.length === 0) {
      console.warn('No task options available for filtering.');
      return [];
    }

    if (value.trim() === '') {
      return this.taskOptions;
    }

    const filterValue = value.toLowerCase();

    return this.taskOptions
      .filter(
        (option) =>
          option.name?.toLowerCase().includes(filterValue) &&
          option.stage !== 'completed'
      )
      .sort((a, b) => b.children.length - a.children.length);
  }

  handleOverlordSelection(selectedTaskId: string) {
    this.selectedOverlordId = selectedTaskId;
    if (!this.selectedOverlordId) return;

    this.taskService
      .getTaskById(this.selectedOverlordId)
      .then((task: TaskoratorTask | null) => {
        if (!task) {
          /**
           * TODO:
           * If a task is discoverable from the helper tree but not retrievable
           * from cache/API, we should surface a clearer stale-tree warning and
           * optionally offer a repair action.
           */
          console.error('Task not found for ID:', this.selectedOverlordId);
          return;
        }
        this.selectedOverlordService.setSelectedOverlord(
          this.taskTransmutationService.toUiTask(task)
        );
      });
  }

  navigateToSelectedOverlord(): void {
    if (this.selectedOverlord && this.selectedOverlord.taskId) {
      this.router.navigate(['/tasks', this.selectedOverlord.taskId]);
    }
  }
}
