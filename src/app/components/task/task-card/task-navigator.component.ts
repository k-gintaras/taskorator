import { Component, OnInit } from '@angular/core';
import { UiTask, TaskoratorTask, getDefaultTask } from '../../models/taskModelManager';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { ErrorService } from '../../services/core/error.service';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskListDataFacadeService } from '../../services/tasks/task-list/task-list-data-facade.service';
// import { StagedTaskListComponent } from '../task/staged-task-list/staged-task-list.component';
import { TaskBatchService } from '../../services/sync-api-cache/task-batch.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TaskEditComponent,
    TaskCardComponent,
    TaskListItemComponent,
    StagedTaskListComponent
  ],
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.tailwind.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: UiTask[] | null = null;
  selectedOverlord: UiTask | null = null;
  stagedTasks: TaskoratorTask[] = [];
  aiApiRawResponse: string = '';
  aiApiSuggestedTasks: string[] = [];
  isLoadingAi: boolean = false;

  constructor(
    private navigatorService: TaskNavigatorService,
    private selectedOverlordService: SelectedOverlordService,
    private taskListFacade: TaskListDataFacadeService,
    private errorService: ErrorService,
    private taskBatchService: TaskBatchService
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


  // Call this with the AI API response string
  setAiApiResponse(response: string) {
    this.aiApiRawResponse = response;
    // Split by newlines, filter empty, trim
    this.aiApiSuggestedTasks = response
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => !!line);
    // Optionally, create stagedTasks as TaskoratorTask[] for preview
    this.stagedTasks = this.aiApiSuggestedTasks.map((name, i) => {
      const t = getDefaultTask();
      t.name = name;
      t.todo = '';
      t.stage = 'todo';
      t.taskId = 'staged-' + Date.now() + '-' + i;
      t.timeCreated = Date.now();
      t.lastUpdated = Date.now();
      t.overlord = this.selectedOverlord?.taskId || '';
      return t;
    });
  }

  async approveStagedTasks() {
    if (!this.selectedOverlord || !this.stagedTasks.length) return;
    try {
      await this.taskBatchService.createTaskBatch(this.stagedTasks, this.selectedOverlord.taskId);
      this.stagedTasks = [];
      this.aiApiSuggestedTasks = [];
      this.aiApiRawResponse = '';
      this.errorService.feedback('Tasks added to overlord!');
    } catch (err) {
      let msg = '';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = (err as any).message;
      } else {
        msg = JSON.stringify(err);
      }
      this.errorService.warn('Failed to add tasks: ' + msg);
    }
  }
}
