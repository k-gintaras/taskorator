import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { LocalService } from 'src/app/services/local.service';
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
export class ParentComponent {
  // tasks$: Observable<Task[]> = new Observable<Task[]>();
  tasks: Task[] = [];
  filtered: Task[] = [];
  selectedOverlordId: number = 0;
  selectedOverlord: Task | undefined;
  private isInitialized = false;
  localSettings: Settings = getDefaultSettings(); // Assuming Settings is your interface

  constructor(
    private settingsService: SettingsService,
    private taskLoaderService: TaskLoaderService,
    private localService: LocalService,
    private f: FeedbackService,
    private route: ActivatedRoute,
    private selectedOverlordService: SelectedOverlordService,
    private taskObjectService: TaskObjectHelperService
  ) {}

  ngOnInit() {
    this.taskLoaderService.loadTasksSlow().subscribe({
      next: () => {
        this.f.log('Tasks loaded and updated in local storage');
      },
      error: (err) => {
        this.f.error('Failed to load tasks:', err);
      },
    });

    this.localService.getAllTasks().subscribe((tasks) => {
      if (tasks) {
        this.tasks = tasks;
        this.filtered = tasks;
        if (tasks.length > 0) {
          this.rememberLastOverlord();
        }
      }
    });
  }

  // }
  rememberLastOverlord() {
    // This comment summarizes the function's purpose: To recall the last selected overlord based on query parameters.
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.selectedOverlordId = Number(params['selectedOverlord']);

      if (this.selectedOverlordId && !this.isInitialized) {
        this.isInitialized = true;

        // Directly using this.tasks array instead of subscribing to an Observable
        const tasks: Task[] = this.tasks;
        const overlord = this.taskObjectService.getTaskById(
          this.selectedOverlordId as number,
          tasks
        );

        if (overlord) {
          this.selectedOverlord = overlord;
          this.selectedOverlordService.setSelectedOverlord(overlord);
        }
      }
    });
  }
}
