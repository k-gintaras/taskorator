import { Component, Input } from '@angular/core';
import { ExtendedTask } from '../../../models/taskModelManager';
import { TaskNodeInfo } from '../../../models/taskTree';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { SelectedMultipleService } from '../../../services/tasks/selected-multiple.service';
import { Task } from '../../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ArtificerComponent } from '../../artificer/artificer.component';
import { TaskMiniComponent } from '../../task/task-mini/task-mini.component';
import { OverlordNavigatorComponentTest } from '../../overlord-navigator/overlord-navigator-test.component';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { getRandomTasks } from '../../../test-files/test-data/test-task';
import { TaskTransmutationService } from '../../../services/tasks/task-transmutation.service';
import { ArtificerActionComponentTest } from '../../task/artificer-action/artificer-action-test.component';

@Component({
  selector: 'app-task-navigator-test',
  standalone: true,
  imports: [
    MatCardModule,
    MatIcon,
    CommonModule,
    TaskMiniComponent,
    ArtificerComponent,
    OverlordNavigatorComponentTest,
    ArtificerActionComponentTest,
  ],
  templateUrl: './task-navigator-test.component.html',
  styleUrl: '../task-navigator.component.scss',
})
export class TaskNavigatorTestComponent {
  @Input() showArtificer: boolean = false;
  tasks: ExtendedTask[] | null = null; // Support any list of tasks
  selectedOverlord: ExtendedTask | undefined;
  errorMessage: string | null = null;
  selectedTasks: Task[] = [];

  constructor(
    // private navigatorService: TaskNavigatorUltraService,
    private treeService: TreeService,
    private selectedMultiple: SelectedMultipleService,
    // private viewService: TaskViewService,
    private transmute: TaskTransmutationService
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

    // this.viewService.tasks$.subscribe({
    //   next: (tasks) => {
    //     this.tasks = tasks;
    //     this.errorMessage = null;
    //   },
    //   error: (err) => {
    //     console.error('Error updating tasks:', err);
    //     this.errorMessage = 'Failed to update tasks.';
    //   },
    // });

    const tasks: Task[] = getRandomTasks();
    const originalListGroup: TaskListKey = {
      type: TaskListType.DAILY,
      data: '',
    };

    this.tasks = this.transmute.toExtendedTasks(tasks);
    // this.navigatorService.loadAndInitializeTasks(tasks, originalListGroup);

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
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
    // try {
    //   await this.navigatorService.next(task.taskId);
    // } catch (error) {
    //   console.error('Error navigating to next tasks:', error);
    //   this.errorMessage = 'Failed to navigate to next tasks.';
    // }
  }

  /**
   * Navigate back to the previous view or selected overlord's tasks.
   */
  async goBack(task: ExtendedTask | undefined): Promise<void> {
    // try {
    //   // if (!task || !task.overlord) {
    //   //   this.logError('No task or overlord available.');
    //   //   return;
    //   // }
    //   await this.navigatorService.backToStart();
    // } catch (error) {
    //   console.error('Error navigating back:', error);
    //   this.errorMessage = 'Failed to navigate back.';
    // }
  }
  /**
   * Navigate back to the previous view or selected overlord's tasks.
   */
  async goBackPrevious(task: ExtendedTask | undefined): Promise<void> {
    // try {
    //   // if (!task || !task.overlord) {
    //   //   this.logError('No task or overlord available.');
    //   //   return;
    //   // }
    //   await this.navigatorService.backToPrevious();
    // } catch (error) {
    //   console.error('Error navigating back:', error);
    //   this.errorMessage = 'Failed to navigate back.';
    // }
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
  getTreeNodeData(task: ExtendedTask): TaskNodeInfo | null {
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
