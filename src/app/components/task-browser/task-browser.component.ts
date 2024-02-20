import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap, take, tap } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { FirebaseDatabaseService } from 'src/app/services/firebase-database.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { TaskService } from 'src/app/services/task.service';
import { completeButtonColorMap } from 'src/app/models/colors';
import {
  CompleteButtonAction,
  Settings,
  getButtonName,
} from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-task-browser',
  templateUrl: './task-browser.component.html',
  styleUrls: ['./task-browser.component.css'],
})
export class TaskBrowserComponent implements OnInit, OnChanges {
  @Input() tasks: Task[] | undefined;
  // @Input() filtered: Task[] | undefined;
  // // @Input() tasks$: Observable<Task[]> = new Observable<Task[]>();
  // @Input() tasks: Task[] | undefined;

  // // tasks: Task[] | null = [];
  selectedOverlord: Task | undefined;

  // selectedTask: Task | null = null;
  // // selectedTasks = new Set<Task>();
  // completeButtonActionName: CompleteButtonAction = 'completed';
  settings: Settings | undefined;
  selectedTasks: Task[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private selectedOverlordService: SelectedOverlordService,
    private f: FeedbackService,
    private taskObjectService: TaskObjectHelperService,
    private taskService: TaskService,
    private selected: SelectedTaskService,
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private selectedMultiple: SelectedMultipleService,
    private firebase: FirebaseDatabaseService
  ) {}

  ngOnInit() {
    // Load settings and selected tasks
    this.settingsService.getSettings().subscribe((s: Settings) => {
      if (s) {
        this.settings = s;
        this.loadPreviouslyViewedTasks();
      }
    });

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  // Assume necessary imports, including `take` from RxJS, are already in place

  loadPreviouslyViewedTasks() {
    // First, subscribe to queryParams to check for an 'overlord' in the URL
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      let overlordId = params['selectedOverlord']; // Attempt to get the overlord ID from URL

      if (!overlordId) {
        // Fallback to settings if URL doesn't contain the desired param
        overlordId = this.settings?.lastOverlordViewId;

        // Further fallback to a default action (e.g., getting the first task) if no suitable ID is found
        if (!overlordId) {
          // Assuming `getFirstTaskId` is a method that retrieves the ID of the first task
          this.firebase.getFirstTaskId().subscribe((firstTaskId) => {
            this.loadOverlordAndChildren(firstTaskId);
          });
          return; // Exit the function early since the rest of the logic will execute asynchronously
        }
      }

      // Proceed to load the overlord and its children using the determined ID
      this.loadOverlordAndChildren(overlordId);
    });
  }

  private loadOverlordAndChildren(overlordId: string) {
    // Load the selected overlord and its children from Firebase
    this.firebase
      .getTaskById(overlordId)
      .subscribe((task: Task | undefined) => {
        if (task) {
          this.selectedOverlord = task;
        } else {
          // Handle the case where the task is undefined, potentially navigating to a default view
        }
      });

    this.firebase.getOverlordChildren(overlordId).subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.setNewFiltered(this.tasks);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.tasks && this.selectedOverlord) {
      // If tasks have changed and both tasks and selectedOverlord are available, trigger the onNext method
      this.onNext(this.selectedOverlord);
    }
  }

  // ngOnInit() {
  //   this.settingsService.getSettings().subscribe((s: Settings) => {
  //     if (s) {
  //       this.settings = s;
  //       // this.completeButtonActionName = s.completeButtonAction;
  //     }
  //   });
  //   this.selectedMultiple
  //     .getSelectedTasks()
  //     .subscribe((selectedTasks: Task[]) => {
  //       this.selectedTasks = selectedTasks;
  //     });

  //   this.loadPreviouslyViewedTasks();
  // }

  // loadPreviouslyViewedTasks() {
  //   if (!this.settings) return;
  //   const overlordToView = this.settings.lastOverlordViewId;

  //   // get this overlord from firebase
  //   this.firebase
  //     .getTaskById(overlordToView)
  //     .subscribe((task: Task | undefined) => {
  //       if (task) {
  //         this.selectedOverlord = task;
  //       }
  //     });
  //   // get this overlord children
  //   this.firebase
  //     .getOverlordChildren(overlordToView)
  //     .subscribe((tasks: Task[]) => {
  //       this.tasks = tasks;
  //     });
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['tasks'] && this.tasks) {
  //     if (this.selectedOverlord) {
  //       this.onNext(this.selectedOverlord);
  //     }
  //   }
  // }

  getButtonName() {
    if (!this.settings) return 'Complete';
    return getButtonName(this.settings.completeButtonAction);
  }

  getColorBySetting() {
    if (!this.settings) return 'black';
    return (
      completeButtonColorMap[this.settings.completeButtonAction] || 'black'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
  }

  onPrevious(task: Task) {
    if (!this.tasks || !task.overlord) {
      console.log('No tasks or overlord defined.');
      return;
    }

    // Fetch the super overlord from the service, which checks the cache first
    this.firebase
      .getSuperOverlord(task.overlord)
      .pipe(
        tap((grandOverlord: Task | undefined) => {
          if (grandOverlord) {
            console.log(grandOverlord.name);
            this.selectedOverlord = grandOverlord;
            this.selectedOverlordService.setSelectedOverlord(
              this.selectedOverlord
            );
            this.selectedOverlordUrlUpdate(grandOverlord);
          } else {
            console.log('No more tasks outside.');
          }
        }),
        switchMap((grandOverlord: Task | undefined) =>
          grandOverlord
            ? this.firebase.getOverlordChildren(grandOverlord.taskId)
            : of(undefined)
        ),
        catchError((error) => {
          console.error('Error fetching tasks', error);
          return of(undefined); // Handle errors and continue the observable chain
        })
      )
      .subscribe((children: Task[] | undefined) => {
        if (children) {
          this.setNewFiltered(children);
        }
      });
  }

  oldOnPrevious() {
    // const overlordId = task.overlord;
    // if (overlordId) {
    //   const overlordTask = this.tasks.find((t) => t.taskId === overlordId);
    //   if (overlordTask) {
    //     // Finding the "grand-overlord" who rules all tasks at the new level.
    //     const grandOverlordId = overlordTask.overlord;
    //     const grandOverlord = this.tasks.find(
    //       (t) => t.taskId === grandOverlordId
    //     );
    //     if (grandOverlord) {
    //       this.selectedOverlord = grandOverlord;
    //       this.selectedOverlordService.setSelectedOverlord(
    //         this.selectedOverlord
    //       );
    //     } else {
    //       // Handle the case where no grand-overlord exists, which probably means we're at the top level.
    //       this.f.log('No more tasks outside.');
    //     }
    //     // Filter tasks that are ruled by the new selectedOverlord.
    //     const f = this.tasks.filter(
    //       (t) => t.overlord === (grandOverlord ? grandOverlord.taskId : null)
    //     );
    //     if (f?.length > 0) {
    //       this.setNewFiltered(f);
    //     }
    //     if (this.selectedOverlord)
    //       this.selectedOverlordUrlUpdate(this.selectedOverlord);
    //   }
    // } else {
    //   console.log('No overlord found for the task'); // Debug line
    // }
  }

  onNext(task: Task) {
    if (!task || !task.taskId) {
      console.error('Invalid task or task ID provided.');
      return;
    }

    this.firebase
      .getOverlordChildren(task.taskId)
      .pipe(
        tap((children: Task[]) => {
          if (children.length > 0) {
            // Children exist, update the UI accordingly
            this.selectedOverlord = task;
            this.selectedOverlordService.setSelectedOverlord(
              this.selectedOverlord
            );
            this.setNewFiltered(children);
            this.selectedOverlordUrlUpdate(task);
          } else {
            // No children found, do nothing
            console.log('No children found for the selected task.');
          }
        }),
        catchError((error) => {
          console.error('Error fetching children tasks', error);
          return of([]); // Return an empty array to gracefully handle the error within the observable chain
        })
      )
      .subscribe();
  }

  onNextOld(task: Task) {
    if (!this.tasks) {
      return;
    }

    const f = this.tasks.filter((t) => t.overlord === task.taskId);

    if (f?.length > 0) {
      this.selectedOverlord = task;
      this.selectedOverlordService.setSelectedOverlord(this.selectedOverlord);
      this.setNewFiltered(f);

      this.selectedOverlordUrlUpdate(task);
    } else {
      // when tasks are completed while we are inside
      // it will not be able to go onNext into empty again
      // reset instead to previous
      if (task.overlord) {
        const overlordTask = this.tasks.find((t) => t.taskId === task.overlord);
        if (overlordTask) {
          this.selectedOverlordService.setSelectedOverlord(overlordTask);
          this.selectedOverlordUrlUpdate(overlordTask);
        }
        // this.f.log('No more tasks inside. Going Back.');
        // this.onPrevious(task);
      }
    }
  }

  setNewFiltered(arr: Task[]) {
    // Set the tasks array
    this.tasks = arr;

    // Filter tasks based on settings
    if (this.settings) {
      this.filterBySettings(this.tasks, this.settings);
    }

    // Sort tasks by priority
    this.sortByPriority();
  }

  // filterBySettings(tasks: Task[]): Task[] {
  //   return [];
  // }

  filterBySettings(tasks: Task[], settings: Settings) {
    this.tasks = tasks.filter((t: Task) => {
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
  }

  // sortByPriority() {
  //   if (!this.filtered) return;
  //   this.filtered.sort((a, b) => {
  //     return b.priority - a.priority;
  //   });
  // }

  sortByPriority() {
    if (!this.tasks) return;
    this.tasks.sort((a, b) => {
      if (b.priority === a.priority) {
        // Ensure lastUpdated is handled correctly
        const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        return timeB - timeA;
      }
      return b.priority - a.priority;
    });
  }

  selectedOverlordUrlUpdate(task: Task) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { selectedOverlord: task.taskId },
      queryParamsHandling: 'merge',
    });
    // this.selectedOverlord = task;
    // this.selectedOverlordService.setSelectedOverlord(this.selectedOverlord);
  }

  onTaskCardClick(task: Task) {
    console.log(task.taskId);
    if (this.selectedTasks.indexOf(task) > -1) {
      // this.selectedTasks.delete(task);
      this.selectedMultiple.removeSelectedTask(task); // Automatically notifies subscribers
    } else {
      // this.selectedTasks.add(task);
      this.selectedMultiple.addSelectedTask(task); // Automatically notifies subscribers
    }

    if (task) {
      this.selected.setSelectedTask(task);
    }
  }

  isSelected(task: Task): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }

  getOverlord(task: Task) {
    if (!this.tasks) return task;
    return this.taskObjectService.getOverlord(task, this.tasks);
  }

  complete(task: Task) {
    // Use the loaded settings directly
    if (this.settings) {
      switch (this.settings.completeButtonAction) {
        case 'completed':
          console.log('completed ' + task.name);
          this.taskService.complete(task);
          break;
        case 'archived':
          console.log('archived ' + task.name);
          this.taskService.archive(task);
          break;
        case 'deleted':
          console.log('deleted ' + task.name);
          this.taskService.delete(task);
          break;
        case 'todo':
          console.log('todo ' + task.name);
          this.taskService.renew(task);
          break;
        case 'seen':
          console.log('seen ' + task.name);
          this.taskService.setAsSeen(task);
          break;
        default:
          break;
      }
    } else {
      // Handle the case when settings are not loaded
      console.error('Settings not loaded');
    }
  }

  addChild(task: Task) {
    this.onClickPlus(task);
  }

  promote(task: Task) {
    this.taskService.increasePriority(task);
  }

  demote(task: Task) {
    this.taskService.decreasePriority(task);
  }
}
