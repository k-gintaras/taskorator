import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { FilterBaseService } from 'src/app/services/filter-base.service';
import { FirebaseDatabaseService } from 'src/app/services/firebase-database.service';
import { LocalService } from 'src/app/services/local.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Settings, getDefaultSettings } from 'src/app/task-model/settings';
import { Task } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css'],
})
export class ParentComponent implements OnInit {
  // tasks$: Observable<Task[]> = new Observable<Task[]>();
  tasks: Task[] = [];
  filtered: Task[] = [];
  selectedOverlordId = '0';
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];
  private isInitialized = false;
  localSettings: Settings = getDefaultSettings(); // Assuming Settings is your interface

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
    private fb: FirebaseDatabaseService
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
    this.fb.fetchTasks().subscribe((tasks) => {
      if (tasks) {
        this.filterTasks(tasks);
      }
    });

    // maybe make its own component of selected tasks;
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  removeTask(t: Task) {
    this.selectedMultiple.removeSelectedTask(t);
  }

  filterTasks(tasks: Task[]) {
    this.settingsService.getSettings().subscribe((settings) => {
      const filtered = tasks.filter((t: Task) => {
        let valid = true;

        if (!settings.isShowArchived && t.stage === 'archived') {
          valid = false;
        }

        if (!settings.isShowCompleted && t.stage === 'completed') {
          valid = false;
        }
        if (!settings.isShowSeen && t.stage === 'seen') {
          valid = false;
        }
        if (!settings.isShowDeleted && t.stage === 'deleted') {
          valid = false;
        }
        if (!settings.isShowTodo && t.stage === 'todo') {
          valid = false;
        }

        // Add more conditions here if needed

        return valid;
      });

      this.tasks = [...filtered];
      this.filtered = [...filtered];
    });

    if (tasks.length > 0) {
      this.rememberLastOverlord();
    }
  }

  // }
  rememberLastOverlord() {
    // This comment summarizes the function's purpose: To recall the last selected overlord based on query parameters.
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.selectedOverlordId = params['selectedOverlord'] || '129'; // Default to 129 if not found

      // Only initialize if not already initialized
      if (!this.isInitialized) {
        this.isInitialized = true;

        // Use this.tasks directly since it's not an Observable
        const tasks: Task[] = this.tasks;

        // Look for the overlord task by its ID
        const overlord = this.taskObjectService.getTaskById(
          this.selectedOverlordId,
          tasks
        );

        // If overlord found, update the selectedOverlord and filtering tasks accordingly
        if (overlord) {
          this.selectedOverlord = overlord;
          this.selectedOverlordService.setSelectedOverlord(overlord);
          const filteredOnOverlord = this.tasks.filter(
            (t) => t.overlord === this.selectedOverlord!.taskId
          );
          this.filterService.setTasks(filteredOnOverlord);
        }
      }
    });
  }
}
