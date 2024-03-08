import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { SelectedTaskService } from 'src/app/archive/selected-task.service';
import { completeButtonColorMap } from 'src/app/models/colors';
import {
  Settings,
  getButtonName,
  getDefaultSettings,
} from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
import { SettingsService } from 'src/app/services/core/settings.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { TaskUpdateService } from 'src/app/services/task-update.service';
import { TaskService } from 'src/app/services/task/task.service';
import { UrlHelperService } from 'src/app/services/url-helper.service';

@Component({
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.html',
  styleUrls: ['./task-navigator.component.css'],
})
export class TaskNavigatorComponent {
  @Input() tasks: Task[] | undefined;
  settings: Settings = getDefaultSettings();
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private selectedOverlordService: SelectedOverlordService,
    private urlHelperService: UrlHelperService,
    private taskUpdateService: TaskUpdateService,
    private taskObjectService: TaskObjectHelperService,
    private selectedMultiple: SelectedMultipleService,
    private selected: SelectedTaskService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // TODO: if url available, load from url if settings avaliable, load from settings (previous task view)
    // Load settings and selected tasks
    this.settingsService.getSettings().then((s: Settings) => {
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
          this.taskService
            .getLatestTaskId()
            .subscribe((firstTaskId: string | undefined) => {
              if (firstTaskId) this.loadOverlordAndChildren(firstTaskId);
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
    this.taskService
      .getTaskById(overlordId)
      .subscribe((task: Task | undefined) => {
        if (task) {
          this.selectedOverlord = task;
        } else {
          // Handle the case where the task is undefined, potentially navigating to a default view
        }
      });

    this.taskService
      .getOverlordChildren(overlordId)
      .subscribe((tasks: Task[] | undefined) => {
        if (tasks) {
          this.setNewFiltered(tasks);
        }
      });
  }

  onPrevious(task: Task) {
    if (!task || !task.overlord) {
      this.errorNoTaskOrOverlord(task);
    } else {
      this.taskService
        .getSuperOverlord(task.overlord)
        .subscribe((superOverlord: Task | undefined) => {
          if (superOverlord) {
            this.selectedOverlordService.setSelectedOverlord(superOverlord);
            this.urlHelperService.selectedOverlordUrlUpdate(superOverlord);
            this.taskService
              .getOverlordChildren(superOverlord.taskId)
              .subscribe((tasks: Task[] | undefined) => {
                if (tasks) {
                  this.setNewFiltered(tasks);
                } else {
                  this.errorNoChildrenInside();
                }
              });
          } else {
            this.errorNoTasksOutside(task);
          }
        });
    }
  }

  onNext(task: Task) {
    if (!task || !task.taskId) {
      console.error('Invalid task or task ID provided.');
    } else {
      this.taskService
        .getOverlordChildren(task.taskId)
        .subscribe((tasks: Task[] | undefined) => {
          if (tasks) {
            // this.tasks = tasks;
            this.setNewFiltered(tasks);
          } else {
            this.errorNoChildrenInside();
          }
        });
    }
  }

  setNewFiltered(arr: Task[]) {
    // TODO: extract it to filterHelper
    // it will simply filter whatever the setup is
    // sorter helper
    // it will simply sort as it is setup
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

  errorNoTaskOrOverlord(task: Task) {
    console.log('No task or task overlord defined.');
  }

  errorNoChildrenInside() {
    throw new Error('Method not implemented.');
  }

  errorNoTasksOutside(task: Task | undefined) {
    throw new Error('Function not implemented.');
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
          this.taskUpdateService.complete(task);
          break;
        case 'archived':
          console.log('archived ' + task.name);
          this.taskUpdateService.archive(task);
          break;
        case 'deleted':
          console.log('deleted ' + task.name);
          this.taskUpdateService.delete(task);
          break;
        case 'todo':
          console.log('todo ' + task.name);
          this.taskUpdateService.renew(task);
          break;
        case 'seen':
          console.log('seen ' + task.name);
          this.taskUpdateService.setAsSeen(task);
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
    this.taskUpdateService.increasePriority(task);
  }

  demote(task: Task) {
    this.taskUpdateService.decreasePriority(task);
  }

  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
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
}
