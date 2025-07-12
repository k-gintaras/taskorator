// TAG: ui,service

import { Component, Input, OnInit } from '@angular/core';
import { ExtendedTask, TaskoratorTask } from '../../models/taskModelManager';
import { ArtificerComponent } from '../artificer/artificer.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { SelectedMultipleService } from '../../services/tasks/selected/selected-multiple.service';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { TaskNodeInfo } from '../../models/taskTree';
import { ColorService } from '../../services/utils/color.service';
import { ErrorService } from '../../services/core/error.service';
import {
  TaskUiStatus,
  TaskStatusService,
} from '../../services/tasks/task-status.service';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';
import { TaskNavigatorDataService } from '../../services/tasks/task-navigation/task-navigator-data.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';

/**
 * @Requirements:
 * - on going back highlight the task we just viewed
 */

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatIcon,
    CommonModule,
    TaskMiniComponent,
    ArtificerActionComponent,
    ArtificerComponent,
    OverlordNavigatorComponent,
    TaskEditComponent,
    TaskCardComponent,
  ],
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.tailwind.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: ExtendedTask[] | null = null; // Support any list of tasks
  selectedTasks: TaskoratorTask[] = [];
  selectedOverlord: ExtendedTask | null = null;

  constructor(
    private taskNavigatorDataService: TaskNavigatorDataService,
    private navigatorService: TaskNavigatorService,
    private treeService: TreeService,
    private selectedMultiple: SelectedMultipleService,
    private selectedOverlordService: SelectedOverlordService,
    private colorService: ColorService,
    private errorService: ErrorService,
    private taskStatusService: TaskStatusService
  ) {}

  ngOnInit(): void {
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

  getTaskStatus(taskId: string) {
    const status = this.taskStatusService.getStatus(taskId);
    return status;
  }

  async onNext(task: ExtendedTask): Promise<void> {
    try {
      await this.navigatorService.navigateInToTask(task.taskId);
      this.taskStatusService.setStatus(task.taskId, 'viewed');
    } catch (error: any) {
      this.errorService.warn('Failed to navigate to next tasks.');
    }
  }

  getTreeNodeData(task: ExtendedTask): TaskNodeInfo | null {
    return this.treeService.getTaskTreeData(task.taskId);
  }

  isSelected(task: ExtendedTask): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }

  getDateBasedColor(timestamp: number): string {
    return this.colorService.getDateBasedColor(timestamp);
  }

  getAgeColor(task: TaskoratorTask): string {
    return this.colorService.getAgeColor(task);
  }

  getProgressPercent(node: TaskNodeInfo | null): number {
    return this.colorService.getProgressPercent(node);
  }

  warn(msg: string): void {
    this.errorService.warn(msg);
  }

  feedback(msg: string): void {
    this.errorService.feedback(msg);
  }
}
