// import { Component, Input } from '@angular/core';
// import { UiTask } from '../../../models/taskModelManager';
// import { TaskNodeInfo } from '../../../models/taskTree';
// import { TreeService } from '../../../services/sync-api-cache/tree.service';
// import { SelectedMultipleService } from '../../../services/tasks/selected/selected-multiple.service';
// import { TaskoratorTask } from '../../../models/taskModelManager';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatIcon } from '@angular/material/icon';
// import { ArtificerComponent } from '../../artificer/artificer.component';
// import { TaskMiniComponent } from '../../task/task-mini/task-mini.component';
// import { OverlordNavigatorComponentTest } from '../../overlord-navigator/overlord-navigator-test.component';
// import { TaskListKey, TaskListType } from '../../../models/task-list-model';
// import { getRandomTasks } from '../../../test-files/test-data/test-task';
// import { TaskTransmutationService } from '../../../services/tasks/task-transmutation.service';
// import { ArtificerActionComponentTest } from '../../task/artificer-action/artificer-action-test.component';
// import { ColorService } from '../../../services/utils/color.service';

// @Component({
//   selector: 'app-task-navigator-test',
//   standalone: true,
//   imports: [
//     MatCardModule,
//     MatIcon,
//     CommonModule,
//     TaskMiniComponent,
//     ArtificerComponent,
//     OverlordNavigatorComponentTest,
//     ArtificerActionComponentTest,
//   ],
//   templateUrl: '../task-navigator.component.html',
//   styleUrl: '../task-navigator.component.scss',
// })
// export class TaskNavigatorTestComponent {
//   @Input() showArtificer: boolean = false;
//   tasks: UiTask[] | null = null; // Support any list of tasks
//   selectedOverlord: UiTask | undefined;
//   errorMessage: string | null = null;
//   selectedTasks: TaskoratorTask[] = [];
//   MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 365 days

//   constructor(
//     // private navigatorService: TaskNavigatorUltraService,
//     private treeService: TreeService,
//     private selectedMultiple: SelectedMultipleService,
//     // private viewService: TaskViewService,
//     private transmute: TaskTransmutationService,
//     private colorService: ColorService
//   ) {}

//   ngOnInit(): void {
//     // Subscribe to TaskViewService for task updates
//     // if (this.tasks && this.taskGroupName) {
//     //   // in case tasks are passed, we can initialize them to simplify the caller job, it will only have to get data and pass that data
//     //   // otherwise it just has to get data, give to tasknavigatorultra to init
//     //   this.navigatorService.loadAndInitializeTasks(
//     //     this.tasks,
//     //     this.taskGroupName
//     //   );
//     // }

//     // this.viewService.tasks$.subscribe({
//     //   next: (tasks) => {
//     //     this.tasks = tasks;
//     //     this.errorMessage = null;
//     //   },
//     //   error: (err) => {
//     //     console.error('Error updating tasks:', err);
//     //     this.errorMessage = 'Failed to update tasks.';
//     //   },
//     // });

//     const tasks: TaskoratorTask[] = getRandomTasks();
//     const originalListGroup: TaskListKey = {
//       type: TaskListType.DAILY,
//       data: '',
//     };

//     this.tasks = this.transmute.toUiTasks(tasks);
//     // this.navigatorService.loadAndInitializeTasks(tasks, originalListGroup);

//     this.selectedMultiple
//       .getSelectedTasks()
//       .subscribe((selectedTasks: TaskoratorTask[]) => {
//         this.selectedTasks = selectedTasks;
//       });
//   }

//   /**
//    * Navigate to the previous set of tasks for a given task.
//    */
//   // async onPrevious(task: ExtendedTask): Promise<void> {
//   //   try {
//   //     await this.navigatorService.previous(task);
//   //   } catch (error) {
//   //     console.error('Error navigating to previous tasks:', error);
//   //     this.errorMessage = 'Failed to navigate to previous tasks.';
//   //   }
//   // }

//   /**
//    * Navigate to the next set of tasks for a given task.
//    */
//   async onNext(task: UiTask): Promise<void> {
//     // try {
//     //   await this.navigatorService.next(task.taskId);
//     // } catch (error) {
//     //   console.error('Error navigating to next tasks:', error);
//     //   this.errorMessage = 'Failed to navigate to next tasks.';
//     // }
//   }

//   /**
//    * Navigate back to the previous view or selected overlord's tasks.
//    */
//   async goBack(task: UiTask | undefined): Promise<void> {
//     // try {
//     //   // if (!task || !task.overlord) {
//     //   //   this.logError('No task or overlord available.');
//     //   //   return;
//     //   // }
//     //   await this.navigatorService.backToStart();
//     // } catch (error) {
//     //   console.error('Error navigating back:', error);
//     //   this.errorMessage = 'Failed to navigate back.';
//     // }
//   }
//   /**
//    * Navigate back to the previous view or selected overlord's tasks.
//    */
//   async goBackPrevious(task: UiTask | undefined): Promise<void> {
//     // try {
//     //   // if (!task || !task.overlord) {
//     //   //   this.logError('No task or overlord available.');
//     //   //   return;
//     //   // }
//     //   await this.navigatorService.backToPrevious();
//     // } catch (error) {
//     //   console.error('Error navigating back:', error);
//     //   this.errorMessage = 'Failed to navigate back.';
//     // }
//   }

//   /**
//    * Check if "Show More" feature is enabled for the task.
//    */
//   isShowMoreEnabled(): boolean {
//     return false; // Placeholder: Update this logic as needed.
//   }

//   /**
//    * Retrieve tree node data for the specified task.
//    */
//   getTreeNodeData(task: UiTask): TaskNodeInfo | null {
//     return this.treeService.getTaskTreeData(task.taskId);
//   }

//   /**
//    * Check if a task is selected.
//    */
//   isSelected(task: UiTask): boolean {
//     return this.selectedTasks.indexOf(task) > -1;
//   }

//   /**
//    * Log errors in the console and optionally handle display.
//    */
//   private logError(message: string): void {
//     console.error(message);
//     this.errorMessage = message;
//   }

//   getAgeRatio(task: TaskoratorTask): number {
//     const ageMs = Date.now() - task.timeCreated;
//     return Math.min(ageMs / this.MAX_AGE_MS, 1);
//   }

//   getAgeColor(ageRatio: number): string {
//     // interpolate between green (#4caf50) and gray (#999999)
//     const green = { r: 76, g: 175, b: 80 };
//     const gray = { r: 153, g: 153, b: 153 };

//     const r = Math.round(green.r + ageRatio * (gray.r - green.r));
//     const g = Math.round(green.g + ageRatio * (gray.g - green.g));
//     const b = Math.round(green.b + ageRatio * (gray.b - green.b));

//     return `rgb(${r},${g},${b})`;
//   }

//   canShowInfo(): boolean {
//     if (!this.tasks) return false;
//     if (!this.selectedOverlord) return false;
//     if (this.tasks.length === 0) return false;
//     return true;
//   }

//   getDateBasedColor(timestamp: number): string {
//     return this.colorService.getDateBasedColor(timestamp);
//   }
//   getProgressPercent(node: TaskNodeInfo | null): number {
//     return this.colorService.getProgressPercent(node);
//   }
// }
