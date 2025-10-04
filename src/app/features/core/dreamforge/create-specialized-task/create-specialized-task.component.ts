import { Component, OnInit } from '@angular/core';
import {
  getDefaultTask,
  TaskType,
  TaskoratorTask,
  UiTask,
} from '../../../../models/taskModelManager';
import { FormsModule } from '@angular/forms';

import { TaskUpdateService } from '../../../../services/tasks/task-update.service';
import { MatIcon } from '@angular/material/icon';
import { ErrorService } from '../../../../services/core/error.service';
import { SelectedOverlordService } from '../../../../services/tasks/selected/selected-overlord.service';
import { OverlordNavigatorComponent } from '../../../../components/overlord-navigator/overlord-navigator.component';

@Component({
  selector: 'app-create-specialized-task',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    OverlordNavigatorComponent
],
  templateUrl: './create-specialized-task.component.html',
  styleUrl: './create-specialized-task.component.scss',
})
export class CreateSpecializedTaskComponent implements OnInit {
  task: TaskoratorTask = getDefaultTask(); // Start with a default task
  selectedOverlord: UiTask | null = null;

  taskTypes: TaskType[] = [
    'code',
    'idea',
    'note',
    'todo',
    'checklist',
    'tree',
    'flowchart',
    'task',
    'next',
    'job',
    'feature',
    'schedule',
    'project',
  ];

  constructor(
    private taskService: TaskUpdateService,
    private errorService: ErrorService,
    private selectedOverlordService: SelectedOverlordService
  ) {}

  ngOnInit(): void {
    // Subscribe to selected overlord changes
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: UiTask | null) => {
        this.selectedOverlord = overlord;
        // Update task overlord when selection changes
        if (overlord) {
          this.task.overlord = overlord.taskId;
        }
      });
  }

  saveTask(): void {
    if (this.task.name.trim() === '') {
      this.errorService.warn('Task name cannot be empty');
      return;
    }
    this.task.lastUpdated = 0;
    this.taskService.create(this.task);
  }

  resetForm(): void {
    this.task = getDefaultTask(); // Reset to default task
  }
}