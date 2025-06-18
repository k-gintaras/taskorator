// TAG: ui,service

import { Component, Input, OnInit } from '@angular/core';
import {
  ExtendedTask,
  getRootTaskObject,
  TaskoratorTask,
} from '../../models/taskModelManager';
import { TaskViewService } from '../../services/tasks/task-view.service';
import { ArtificerComponent } from '../artificer/artificer.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { SelectedMultipleService } from '../../services/tasks/selected-multiple.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigator-ultra.service';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { TaskNodeInfo } from '../../models/taskTree';
import { ColorService } from '../../services/utils/color.service';
import { ErrorService } from '../../services/core/error.service';
import {
  TaskUiStatus,
  TaskStatusService,
} from '../../services/tasks/task-status.service';

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
  @Input() showArtificer: boolean = false;
  tasks: ExtendedTask[] | null = null; // Support any list of tasks
  selectedOverlord: ExtendedTask | TaskoratorTask = getRootTaskObject();
  errorMessage: string | null = null;
  selectedTasks: TaskoratorTask[] = [];

  constructor(
    private navigatorService: TaskNavigatorUltraService,
    private treeService: TreeService,
    private selectedMultiple: SelectedMultipleService,
    private selectedOverlordService: SelectedOverlordService,
    private viewService: TaskViewService,
    private taskService: TaskService,
    private colorService: ColorService,
    private errorService: ErrorService,
    private taskStatusService: TaskStatusService
  ) {}

  ngOnInit(): void {
    this.viewService.tasks$.subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error updating tasks:', err);
        this.errorMessage = 'Failed to update tasks.';
      },
    });

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: TaskoratorTask[]) => {
        this.selectedTasks = selectedTasks;
      });

    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((id: string | null) => {
        if (!id) return;
        this.taskService.getTaskById(id).then((t: ExtendedTask | null) => {
          if (!t) return;
          this.selectedOverlord = t;
        });
      });
  }

  getTaskStatus(taskId: string) {
    const status = this.taskStatusService.getStatus(taskId);
    return status;
  }

  canShowInfo(): boolean {
    if (!this.tasks) return false;
    if (!this.selectedOverlord) return false;
    if (this.tasks.length === 0) return false;
    return true;
  }

  async onNext(task: ExtendedTask): Promise<void> {
    try {
      await this.navigatorService.next(task.taskId);
      this.taskStatusService.setStatus(task.taskId, 'viewed');
    } catch (error: any) {
      this.errorService.warn('Failed to navigate to next tasks.');
    }
  }

  async goBack(task?: ExtendedTask): Promise<void> {
    try {
      await this.navigatorService.backToStart();
    } catch (error: any) {
      this.errorService.warn('Failed to navigate back.');
    }
  }

  async goBackPrevious(task?: ExtendedTask): Promise<void> {
    try {
      await this.navigatorService.backToPrevious();
    } catch (error: any) {
      console.error('Error navigating back:', error);
      this.errorService.warn('Failed to navigate back.');
    }
  }

  isShowMoreEnabled(): boolean {
    return false; // Placeholder: Update this logic as needed.
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
