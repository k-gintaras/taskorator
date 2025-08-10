import { Component, OnInit } from '@angular/core';
import { UiTask } from '../../models/taskModelManager';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { ErrorService } from '../../services/core/error.service';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskListDataFacadeService } from '../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TaskEditComponent,
    TaskCardComponent,
    TaskListItemComponent
  ],
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.tailwind.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: UiTask[] | null = null;
  selectedOverlord: UiTask | null = null;

  constructor(
    private navigatorService: TaskNavigatorService,
    private selectedOverlordService: SelectedOverlordService,
    private taskListFacade: TaskListDataFacadeService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.taskListFacade.currentTasks$.subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord) => {
        this.selectedOverlord = overlord;
      });
  }

  async onNext(task: UiTask): Promise<void> {
    try {
      await this.navigatorService.navigateInToTask(task.taskId);
    } catch (error: any) {
      this.errorService.warn('Failed to navigate to next tasks.');
    }
  }

  // Utility methods for improved UI
  trackByTaskId(index: number, task: UiTask): string {
    return task.taskId;
  }

  getDateBasedColor(timestamp: number): string {
    const today = new Date();
    const taskDate = new Date(timestamp);
    const diffTime = Math.abs(today.getTime() - taskDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Color gradient based on age - following design system
    if (diffDays <= 1) return '#27ae60'; // Green for recent
    if (diffDays <= 3) return '#007bff'; // Blue for medium  
    if (diffDays <= 7) return '#ffc107'; // Yellow for old
    return '#c0392b'; // Red for very old
  }

  getProgressPercent(task: any): number {
    // Simple progress calculation - can be enhanced based on actual task structure
    if (!task || !task.children || task.children.length === 0) {
      return task?.completed ? 100 : 0;
    }
    
    const completedChildren = task.children.filter((child: any) => child.completed).length;
    return Math.round((completedChildren / task.children.length) * 100);
  }

  getTreeNodeData(task: UiTask): any {
    // Return task data for progress calculation
    // This should be adapted based on your actual tree structure
    return task;
  }
}
