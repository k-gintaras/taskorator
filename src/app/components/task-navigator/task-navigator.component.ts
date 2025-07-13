// TAG: ui,service

import { Component, OnInit } from '@angular/core';
import { UiTask, TaskoratorTask } from '../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SelectedMultipleService } from '../../services/tasks/selected/selected-multiple.service';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { ErrorService } from '../../services/core/error.service';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';
import { TaskNavigatorDataService } from '../../services/tasks/task-navigation/task-navigator-data.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskStatusService } from '../../services/tasks/task-status.service';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';

/**
 * @Requirements:
 * - on going back highlight the task we just viewed
 */

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    TaskEditComponent,
    TaskCardComponent,
    TaskListItemComponent,
  ],
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.tailwind.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: UiTask[] | null = null;
  selectedTasks: TaskoratorTask[] = [];
  selectedOverlord: UiTask | null = null;

  constructor(
    private taskNavigatorDataService: TaskNavigatorDataService,
    private navigatorService: TaskNavigatorService,
    private selectedMultiple: SelectedMultipleService,
    private selectedOverlordService: SelectedOverlordService,
    private errorService: ErrorService,
    private taskStatusService: TaskStatusService
  ) {}

  ngOnInit(): void {
    // Just subscribe to data - no UI calculations here
    this.taskNavigatorDataService.currentTasks$.subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord) => {
        this.selectedOverlord = overlord;
      });

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: TaskoratorTask[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  async onNext(task: UiTask): Promise<void> {
    try {
      await this.navigatorService.navigateInToTask(task.taskId);
      this.taskStatusService.markAsViewed(task.taskId);
    } catch (error: any) {
      this.errorService.warn('Failed to navigate to next tasks.');
    }
  }

  onTaskClick(task: UiTask): void {
    this.selectedMultiple.addRemoveSelectedTask(task);
  }

  isTaskSelected(task: UiTask): boolean {
    console.log('Checking if task is selected:', task);
    return this.selectedMultiple.isSelected(task);
  }
}
