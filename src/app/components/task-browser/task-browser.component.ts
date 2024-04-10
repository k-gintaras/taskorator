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
import { SortService } from 'src/app/services/task/sort.service';
import { FilterService } from 'src/app/services/task/filter.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * @deprecated use task-navigator, because this uses firebase directly and is unwanted
 */
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
  initializedSettings = false;

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
    private sortService: SortService,
    private filterService: FilterService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Load settings and selected tasks
    this.settingsService.getSettings().subscribe((s: Settings) => {
      if (s && !this.initializedSettings) {
        this.settings = s;
        this.initializedSettings = true;
        // TODO: see if on changed settings the stuff is not unnecessarily loaded from server
        this.loadPreviouslyViewedTasks();
      }
    });

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  loadPreviouslyViewedTasks() {
    console.log('loading previous task');
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      let overlordId = params['selectedOverlord']; // Attempt to get the overlord ID from URL

      if (!overlordId) {
        // Fallback to settings if URL doesn't contain the desired param
        overlordId = this.settings?.lastOverlordViewId;

        // Further fallback to a default action (e.g., getting the first task) if no suitable ID is found
        if (!overlordId) {
          // Assuming `getFirstTaskId` is a method that retrieves the ID of the first task
          this.apiService.fetchTasks().subscribe((tasks: Task[]) => {
            this.loadOverlordAndChildren(tasks[0].taskId);
          });

          this.apiService.fetchTasks();
          return; // Exit the function early since the rest of the logic will execute asynchronously
        }
      }

      // Proceed to load the overlord and its children using the determined ID
      this.loadOverlordAndChildren(overlordId);
    });
  }

  private loadOverlordAndChildren(overlordId: string) {
    // Load the selected overlord and its children from Firebase
    // this.firebase
    //   .getTaskById(overlordId)
    //   .subscribe((task: Task | undefined) => {
    //     if (task) {
    //       this.selectedOverlord = task;
    //     } else {
    //       // Handle the case where the task is undefined, potentially navigating to a default view
    //     }
    //   });

    this.apiService.fetchTasks().subscribe((tasks: Task[]) => {
      const overlord = tasks.filter((task) => {
        task.taskId === overlordId;
      });
      if (overlord) {
        this.selectedOverlord = overlord[0];
      } else {
        // Handle the case where the task is undefined, potentially navigating to a default view
      }
    });

    // this.firebase.getOverlordChildren(overlordId).subscribe((tasks: Task[]) => {
    //   this.tasks = tasks;
    //   this.setNewFiltered(this.tasks);
    // });
    this.apiService.fetchTasks().subscribe((tasks: Task[]) => {
      const children = tasks.filter((task) => {
        task.overlord === overlordId;
      });
      if (children) {
        this.tasks = children;
      } else {
        // Handle the case where the task is undefined, potentially navigating to a default view
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.tasks && this.selectedOverlord) {
      // If tasks have changed and both tasks and selectedOverlord are available, trigger the onNext method
      this.onNext(this.selectedOverlord);
    }
  }

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
  }

  onNext(task: Task) {
    if (!task || !task.taskId) {
      console.error('Invalid task or task ID provided.');
      return;
    }
  }

  setNewFiltered(arr: Task[]) {
    // Set the tasks array
    this.tasks = arr;

    // Filter tasks based on settings
    if (this.settings) {
      this.filterService.filterBySettings(this.tasks, this.settings);
    }

    // Sort tasks by priority
    this.sortService.sortByPriority(this.tasks);
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
