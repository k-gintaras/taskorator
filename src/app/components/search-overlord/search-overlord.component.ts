import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { map, Observable, startWith } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { TreeNodeService } from '../../services/tree/tree-node.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskoratorTask } from '../../models/taskModelManager';
import { AsyncPipe, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../services/tree/task-tree-node-tools.service';
import { TaskTransmutationService } from '../../services/tasks/task-transmutation.service';

@Component({
  selector: 'app-search-overlord',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    MatFormField,
    MatLabel,
    SlicePipe,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    NgIf,
  ],
  templateUrl: './search-overlord.component.html',
  styleUrl: './search-overlord.component.scss',
})
export class SearchOverlordComponent implements OnInit {
  filteredTaskOptions: Observable<TaskTreeNode[] | null> | null = null;
  selectedOverlordId = '';
  taskSearchCtrl: FormControl = new FormControl();

  taskOptions: TaskTreeNode[] = []; // Initialize with an empty list

  constructor(
    private treeService: TreeService,
    private treeNodeToolsService: TaskTreeNodeToolsService,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private taskTransmutationService: TaskTransmutationService
  ) {}

  ngOnInit() {
    // this.authService
    //   .isAuthenticatedObservable()
    //   .subscribe((isAuthenticated) => {
    //     if (isAuthenticated) {
    //       this.loadTaskOptions();
    //     }
    //   });

    // Set up the filter for the select options
    this.filteredTaskOptions = this.taskSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTasks(value || ''))
    );
  }

  // ngOnInit() {
  //   this.loadTaskOptions();

  //   // Set up the filter for the select options
  //   this.filteredTaskOptions = this.taskSearchCtrl.valueChanges.pipe(
  //     startWith(''), // Ensure it starts with an empty string
  //     map((value) => this.filterTasks(value || ''))
  //   );
  // }

  loadTaskOptions() {
    this.treeService.getTree().subscribe((taskTree) => {
      if (taskTree) {
        console.log('Task tree loaded @ search overlord:', taskTree);
        this.taskOptions = this.treeNodeToolsService.getFlattened(taskTree);
        // Re-trigger the filtering logic to include newly loaded options
        this.taskSearchCtrl.setValue(this.taskSearchCtrl.value || '');
      }
    });
  }

  filterTasks(value: string): TaskTreeNode[] {
    if (!this.taskOptions || this.taskOptions.length === 0) {
      console.warn('No task options available for filtering.');
      return [];
    }

    if (value.trim() === '') {
      // If the search value is empty, return all options
      return this.taskOptions;
    }

    const filterValue = value.toLowerCase();

    return this.taskOptions
      .filter(
        (option) =>
          option.name?.toLowerCase().includes(filterValue) && // Safely check for name
          option.stage !== 'completed'
      )
      .sort((a, b) => b.children.length - a.children.length); // Sort by number of children
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
           * if task is not found, means it is in tree, but not in database anymore
           * means tree is kinda broken, on task deletion it doesnt react?
           */
          console.error('Task not found for ID:', this.selectedOverlordId);
          return;
        }
        this.selectedOverlordService.setSelectedOverlord(
          this.taskTransmutationService.toUiTask(task)
        );
      });
  }
}
