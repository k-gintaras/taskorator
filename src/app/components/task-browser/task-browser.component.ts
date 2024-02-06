import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { TaskService } from 'src/app/services/task.service';
import { completeButtonColorMap } from 'src/app/task-model/colors';
import {
  CompleteButtonAction,
  Settings,
  getButtonName,
} from 'src/app/task-model/settings';
import { Task } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-task-browser',
  templateUrl: './task-browser.component.html',
  styleUrls: ['./task-browser.component.css'],
})
export class TaskBrowserComponent implements OnInit, OnChanges {
  // @Input() tasks: Task[] | undefined;
  @Input() filtered: Task[] | undefined;
  // @Input() tasks$: Observable<Task[]> = new Observable<Task[]>();
  @Input() tasks: Task[] | undefined;

  // tasks: Task[] | null = [];
  @Input() selectedOverlord: Task | undefined;

  selectedTask: Task | null = null;
  // selectedTasks = new Set<Task>();
  completeButtonActionName: CompleteButtonAction = 'completed';
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
    private selectedMultiple: SelectedMultipleService
  ) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe((s: Settings) => {
      if (s) {
        this.completeButtonActionName = s.completeButtonAction;
      }
    });
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.tasks) {
      if (this.selectedOverlord) {
        this.onNext(this.selectedOverlord);
      }
    }
  }

  getButtonName() {
    return getButtonName(this.completeButtonActionName);
  }

  getColorBySetting() {
    return completeButtonColorMap[this.completeButtonActionName] || 'black';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
  }

  onPrevious(task: Task) {
    if (!this.tasks) {
      return;
    }

    const overlordId = task.overlord;

    if (overlordId) {
      const overlordTask = this.tasks.find((t) => t.taskId === overlordId);
      if (overlordTask) {
        // Finding the "grand-overlord" who rules all tasks at the new level.
        const grandOverlordId = overlordTask.overlord;
        const grandOverlord = this.tasks.find(
          (t) => t.taskId === grandOverlordId
        );

        if (grandOverlord) {
          this.selectedOverlord = grandOverlord;
          this.selectedOverlordService.setSelectedOverlord(
            this.selectedOverlord
          );
        } else {
          // Handle the case where no grand-overlord exists, which probably means we're at the top level.
          this.f.log('No more tasks outside.');
        }

        // Filter tasks that are ruled by the new selectedOverlord.
        const f = this.tasks.filter(
          (t) => t.overlord === (grandOverlord ? grandOverlord.taskId : null)
        );
        if (f?.length > 0) {
          this.setNewFiltered(f);
        }
        if (this.selectedOverlord)
          this.selectedOverlordUpdate(this.selectedOverlord);
      }
    } else {
      console.log('No overlord found for the task'); // Debug line
    }
  }

  onNext(task: Task) {
    if (!this.tasks) {
      return;
    }

    const f = this.tasks.filter((t) => t.overlord === task.taskId);

    if (f?.length > 0) {
      this.selectedOverlord = task;
      this.selectedOverlordService.setSelectedOverlord(this.selectedOverlord);
      this.setNewFiltered(f);

      this.selectedOverlordUpdate(task);
    } else {
      // when tasks are completed while we are inside
      // it will not be able to go onNext into empty again
      // reset instead to previous
      if (task.overlord) {
        const overlordTask = this.tasks.find((t) => t.taskId === task.overlord);
        if (overlordTask) {
          this.selectedOverlordService.setSelectedOverlord(overlordTask);
          this.selectedOverlordUpdate(overlordTask);
        }
        // this.f.log('No more tasks inside. Going Back.');
        // this.onPrevious(task);
      }
    }
  }

  setNewFiltered(arr: Task[]) {
    this.filtered = [...arr];
    this.sortByPriority();
  }

  // sortByPriority() {
  //   if (!this.filtered) return;
  //   this.filtered.sort((a, b) => {
  //     return b.priority - a.priority;
  //   });
  // }

  sortByPriority() {
    if (!this.filtered) return;
    this.filtered.sort((a, b) => {
      if (b.priority === a.priority) {
        // Ensure lastUpdated is handled correctly
        const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        return timeB - timeA;
      }
      return b.priority - a.priority;
    });
  }

  selectedOverlordUpdate(task: Task) {
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
    this.settingsService
      .getSettings()
      .pipe(take(1))
      .subscribe((settings) => {
        // Use the 'settings' here
        // Your logic based on settings
        switch (settings.completeButtonAction) {
          case 'completed':
            console.log('completed' + ' ' + task.name);
            this.taskService.complete(task);
            break;
          case 'archived':
            console.log('archived' + ' ' + task.name);
            this.taskService.archive(task);
            break;
          case 'deleted':
            console.log('deleted' + ' ' + task.name);
            this.taskService.delete(task);
            break;
          case 'todo':
            console.log('todo' + ' ' + task.name);
            this.taskService.renew(task);
            break;
          case 'seen':
            console.log('seen' + ' ' + task.name);
            this.taskService.setAsSeen(task);
            break;

          default:
            break;
        }
      });
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
