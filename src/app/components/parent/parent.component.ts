import { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subscription,
  combineLatest,
  filter,
  map,
  take,
} from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { FilterBaseService } from 'src/app/services/filter-base.service';
import { FirebaseDatabaseService } from 'src/app/services/firebase-database.service';
import { LocalService } from 'src/app/services/local.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Settings, getDefaultSettings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css'],
})
export class ParentComponent implements OnInit, OnDestroy {
  // tasks$: Observable<Task[]> = new Observable<Task[]>();
  // tasks: Task[] = [];
  // filtered: Task[] = [];
  selectedOverlordId = '0';
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];
  private isInitialized = false;
  settings: Settings = getDefaultSettings(); // Assuming Settings is your interface
  private subscription: Subscription | undefined;

  constructor(
    public settingsService: SettingsService,
    private taskLoaderService: TaskLoaderService,
    private localService: LocalService,
    private f: FeedbackService,
    private route: ActivatedRoute,
    private selectedOverlordService: SelectedOverlordService,
    private taskObjectService: TaskObjectHelperService,
    private filterService: FilterBaseService,
    private selectedMultiple: SelectedMultipleService,
    private taskService: FirebaseDatabaseService
  ) {}

  ngOnInit() {
    // this.taskLoaderService.loadTasksSlow().subscribe({
    //   next: () => {
    //     this.f.log('Tasks loaded and updated in local storage');
    //   },
    //   error: (err) => {
    //     this.f.error('Failed to load tasks:', err);
    //   },
    // });

    // this.localService.getAllTasks().subscribe((tasks) => {
    //   if (tasks) {
    //     this.filterTasks(tasks);
    //   }
    // });
    // NEW REPLACEMENT
    // this.fb.fetchTasks().subscribe((tasks) => {
    //   if (tasks) {
    //     this.filterTasks(tasks);
    //   }
    // });

    // this.settingsService.getSettings().subscribe((settings) => {
    //   this.settings = settings;
    //   // Perform actions based on the current settings
    // });

    // do same with settings now

    // export interface Settings {
    //   isShowArchived: boolean;
    //   isShowCompleted: boolean;
    //   isShowSeen: boolean;
    //   isShowDeleted: boolean;
    //   isShowTodo: boolean;
    //   completeButtonAction: CompleteButtonAction;
    //   lastOverlordViewId: number;
    //   // ... more settings here
    // }

    // export function getDefaultSettings() {
    //   const settings: Settings = {
    //     isShowArchived: false,
    //     isShowCompleted: false,
    //     isShowSeen: true,
    //     isShowDeleted: false,
    //     isShowTodo: true,
    //     completeButtonAction: 'completed',
    //     lastOverlordViewId: 128, // the base overlord for all tasks forever
    //   };
    //   return { ...settings };
    // }

    // maybe make its own component of selected tasks;
    // this.selectedMultiple
    //   .getSelectedTasks()
    //   .subscribe((selectedTasks: Task[]) => {
    //     this.selectedTasks = selectedTasks;
    //   });
    // this.fetchTasksAndApplySettings();
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  // fetchTasksAndApplySettings() {
  //   if (!this.taskService.tasks$) return;
  //   this.subscription = combineLatest([
  //     this.taskService.tasks$,
  //     this.settingsService.settings$,
  //   ]).subscribe(([tasks, settings]) => {
  //     // Your subscription logic
  //     this.filterTasks(tasks, settings);
  //     this.rememberLastOverlord();
  //   });
  // }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  filterTasks(tasks: Task[], settings: Settings) {
    console.log('TEST filtering');
    const filtered = tasks.filter((t: Task) => {
      // Task should be included if it matches any of the criteria for being shown
      return (
        (settings.isShowArchived && t.stage === 'archived') ||
        (settings.isShowCompleted && t.stage === 'completed') ||
        (settings.isShowSeen && t.stage === 'seen') ||
        (settings.isShowDeleted && t.stage === 'deleted') ||
        (settings.isShowTodo && t.stage === 'todo') ||
        // If none of the settings apply, it means we don't want to filter this task out based on its stage
        // This line is necessary if there are stages not covered by the settings, adjust as needed
        (!settings.isShowArchived &&
          !settings.isShowCompleted &&
          !settings.isShowSeen &&
          !settings.isShowDeleted &&
          !settings.isShowTodo)
      );
    });

    console.log(`Filtered tasks count: ${filtered.length}`);

    // this.tasks = [...filtered];
    // this.filtered = [...filtered];
    this.settings = settings;
  }

  removeTask(t: Task) {
    this.selectedMultiple.removeSelectedTask(t);
  }

  // filterTasks(tasks: Task[]) {
  //   console.log('TEST' + 'filtering');

  //   this.settingsService.getSettings().subscribe((settings) => {
  //     console.log('TEST' + settings.isShowCompleted);

  //     const filtered = tasks.filter((t: Task) => {
  //       let valid = true;

  //       if (!settings.isShowArchived && t.stage === 'archived') {
  //         valid = false;
  //       }

  //       if (!settings.isShowCompleted && t.stage === 'completed') {
  //         valid = false;
  //       }
  //       if (!settings.isShowSeen && t.stage === 'seen') {
  //         valid = false;
  //       }
  //       if (!settings.isShowDeleted && t.stage === 'deleted') {
  //         valid = false;
  //       }
  //       if (!settings.isShowTodo && t.stage === 'todo') {
  //         valid = false;
  //       }

  //       // Add more conditions here if needed

  //       return valid;
  //     });

  //     this.tasks = [...filtered];
  //     this.filtered = [...filtered];
  //   });

  //   if (tasks.length > 0) {
  //     this.rememberLastOverlord();
  //   }
  // }

  // }
  // rememberLastOverlord() {
  //   console.log(this.settings);
  //   this.route.queryParams.pipe(take(1)).subscribe((params) => {
  //     // Attempt to get the overlord ID from query params or use a default placeholder
  //     const overlordId =
  //       this.settings.lastOverlordViewId || params['selectedOverlord'];

  //     // Only initialize if not already initialized
  //     if (!this.isInitialized) {
  //       this.isInitialized = true;

  //       let overlord: Task | undefined = undefined;

  //       // Try to find the overlord by ID
  //       if (overlordId) {
  //         overlord = this.tasks.find((t) => t.taskId === overlordId);
  //       }

  //       // If no overlord is found by ID or no ID is provided, select the latest task
  //       if (!overlord && this.tasks.length > 0) {
  //         overlord = this.tasks[0];
  //       }

  //       // Check if an overlord is found or selected as the latest, then proceed with setting it
  //       if (overlord) {
  //         this.selectedOverlord = overlord;
  //         this.selectedOverlordService.setSelectedOverlord(overlord);

  //         // Directly use overlord.taskId since overlord is guaranteed to be not null here
  //         const overlordTaskId = overlord.taskId;
  //         const filteredOnOverlord = this.tasks.filter(
  //           (t) => t.overlord === overlordTaskId
  //         );
  //         this.filterService.setTasks(filteredOnOverlord);
  //       }
  //     }
  //   });
  // }
}
