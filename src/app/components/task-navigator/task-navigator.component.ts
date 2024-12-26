import { Component, Input, OnInit } from '@angular/core';
import { ExtendedTask, getBaseTask, Task } from '../../models/taskModelManager';
import { TaskViewService } from '../../services/tasks/task-view.service';
import { ArtificerComponent } from '../artificer/artificer.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TaskTreeNodeData } from '../../models/taskTree';
import { TreeService } from '../../services/core/tree.service';
import { SelectedMultipleService } from '../../services/task/selected-multiple.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigator-ultra.service';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { SelectedOverlordService } from '../../services/task/selected-overlord.service';
import { TaskService } from '../../services/tasks/task.service';
import { TaskCardComponent } from '../task/task-card/task-card.component';

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
  templateUrl: './task-navigator.component.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  @Input() showArtificer: boolean = false;
  tasks: ExtendedTask[] | null = null; // Support any list of tasks
  selectedOverlord: ExtendedTask | Task = getBaseTask();
  errorMessage: string | null = null;
  selectedTasks: Task[] = [];

  constructor(
    private navigatorService: TaskNavigatorUltraService,
    private treeService: TreeService,
    private selectedMultiple: SelectedMultipleService,
    private selectedOverlordService: SelectedOverlordService,
    private viewService: TaskViewService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Subscribe to TaskViewService for task updates
    // if (this.tasks && this.taskGroupName) {
    //   // in case tasks are passed, we can initialize them to simplify the caller job, it will only have to get data and pass that data
    //   // otherwise it just has to get data, give to tasknavigatorultra to init
    //   this.navigatorService.loadAndInitializeTasks(
    //     this.tasks,
    //     this.taskGroupName
    //   );
    // }
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
      .subscribe((selectedTasks: Task[]) => {
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

  canShowInfo(): boolean {
    if (!this.tasks) return false;
    if (!this.selectedOverlord) return false;
    if (this.tasks.length === 0) return false;
    return true;
  }

  /**
   * Navigate to the previous set of tasks for a given task.
   */
  // async onPrevious(task: ExtendedTask): Promise<void> {
  //   try {
  //     await this.navigatorService.previous(task);
  //   } catch (error) {
  //     console.error('Error navigating to previous tasks:', error);
  //     this.errorMessage = 'Failed to navigate to previous tasks.';
  //   }
  // }

  /**
   * Navigate to the next set of tasks for a given task.
   */
  async onNext(task: ExtendedTask): Promise<void> {
    try {
      await this.navigatorService.next(task.taskId);
    } catch (error) {
      console.error('Error navigating to next tasks:', error);
      this.errorMessage = 'Failed to navigate to next tasks.';
    }
  }

  /**
   * Navigate back to the previous view or selected overlord's tasks.
   */
  async goBack(task: ExtendedTask | undefined): Promise<void> {
    try {
      // if (!task || !task.overlord) {
      //   this.logError('No task or overlord available.');
      //   return;
      // }
      await this.navigatorService.backToStart();
    } catch (error) {
      console.error('Error navigating back:', error);
      this.errorMessage = 'Failed to navigate back.';
    }
  }
  /**
   * Navigate back to the previous view or selected overlord's tasks.
   */
  async goBackPrevious(task: ExtendedTask | undefined): Promise<void> {
    try {
      // if (!task || !task.overlord) {
      //   this.logError('No task or overlord available.');
      //   return;
      // }
      await this.navigatorService.backToPrevious();
    } catch (error) {
      console.error('Error navigating back:', error);
      this.errorMessage = 'Failed to navigate back.';
    }
  }

  /**
   * Check if "Show More" feature is enabled for the task.
   */
  isShowMoreEnabled(): boolean {
    return false; // Placeholder: Update this logic as needed.
  }

  /**
   * Retrieve tree node data for the specified task.
   */
  getTreeNodeData(task: ExtendedTask): TaskTreeNodeData | undefined {
    return this.treeService.getTaskTreeData(task.taskId);
  }

  /**
   * Check if a task is selected.
   */
  isSelected(task: ExtendedTask): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }

  /**
   * Log errors in the console and optionally handle display.
   */
  private logError(message: string): void {
    console.error(message);
    this.errorMessage = message;
  }
}
