import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { map, Observable, startWith } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { TreeService } from '../../services/core/tree.service';
import { TreeNodeService } from '../../services/core/tree-node.service';
import { SelectedOverlordService } from '../../services/task/selected-overlord.service';
import { getDefaultTask, Task } from '../../models/taskModelManager';
import { TaskService } from '../../services/task/task.service';
import { AsyncPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-search-overlord',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatButton,
  ],
  templateUrl: './search-overlord.component.html',
  styleUrl: './search-overlord.component.scss',
})
export class SearchOverlordComponent implements OnInit {
  filteredTaskOptions: Observable<TaskTreeNode[]> | undefined;
  selectedOverlordId = '';
  taskSearchCtrl: FormControl = new FormControl();

  taskOptions: TaskTreeNode[] = [];

  constructor(
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService
  ) {
    this.filteredTaskOptions = this.taskSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTasks(value))
    );
  }

  ngOnInit() {
    this.loadTaskOptions();
  }

  loadTaskOptions() {
    this.treeService.getTree().subscribe((taskTree) => {
      if (taskTree) {
        this.taskOptions = this.treeNodeService.getFlattened(taskTree);
      }
    });
  }

  handleOverlordSelection(selectedTaskId: string) {
    this.selectedOverlordId = selectedTaskId;
    if (!this.selectedOverlordId) return;

    this.taskService
      .getTaskById(this.selectedOverlordId)
      .then((t: Task | undefined) => {
        if (!t) return;
        this.selectedOverlordService.setSelectedOverlord(t);
      });
  }

  filterTasks(value: string): TaskTreeNode[] {
    const filterValue = value.toLowerCase();
    return this.taskOptions
      .filter(
        (option) =>
          option.name.toLowerCase().includes(filterValue) && !option.isCompleted
      )
      .sort((a, b) => b.children.length - a.children.length);
  }
}
