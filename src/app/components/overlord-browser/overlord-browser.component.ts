import { Component, Input, SimpleChanges } from '@angular/core';
import { FeedbackService } from 'src/app/services/feedback.service';
import { FilterHelperService } from 'src/app/services/filter-helper.service';
import { ListService } from 'src/app/services/list.service';
import { LocalService } from 'src/app/services/local.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { SyncService } from 'src/app/services/sync.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { TaskService } from 'src/app/services/task.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overlord-browser',
  templateUrl: './overlord-browser.component.html',
  styleUrls: ['./overlord-browser.component.scss'],
})
export class OverlordBrowserComponent {
  constructor(
    private local: LocalService,
    private sync: SyncService,
    private taskLoaderService: TaskLoaderService,
    private filters: FilterHelperService,
    private selected: SelectedTaskService,
    private listService: ListService,
    private taskService: TaskService,
    private feedbackService: FeedbackService,
    private taskObjectService: TaskObjectHelperService,
    private selectedOverlordService: SelectedOverlordService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  @Input() overlords: Task[] | undefined;
  @Input() tasks: Task[] | undefined;
  @Input() filtered: Task[] | undefined;
  actionName = 'back';

  isSortPriority = true;

  currentOverlord: Task | undefined;
  selectedOverlord: Task | undefined;
  selectedTask: Task | null = null;

  selectedTasks = new Set<Task>();

  isAllSelected = false;

  visibilityMap = new Map<string, boolean>();

  toggleVisibility(task: Task) {
    const currentStatus = this.visibilityMap.get(task.taskId) || false;
    this.visibilityMap.set(task.taskId, !currentStatus);
  }

  isVisible(task: Task): boolean {
    return this.visibilityMap.get(task.taskId) || false;
  }

  getOverlord(task: Task) {
    if (!this.tasks) return task;
    return this.taskObjectService.getOverlord(task, this.tasks);
  }

  // ngOnInit() {
  //   this.route.queryParams.subscribe((params) => {
  //     const overlordId = params['currentOverlord'];
  //     if (overlordId && this.tasks) {
  //       this.currentOverlord = this.tasks.find(
  //         (task) => task.taskId === overlordId
  //       );
  //       if (this.currentOverlord) {
  //         console.log('qq');
  //         this.onNext(this.currentOverlord);
  //       } else {
  //         console.log('111 qq');
  //         console.log(this.tasks);
  //       }
  //     }
  //   });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.tasks) {
      if (this.currentOverlord) {
        this.onNext(this.currentOverlord);
      }
    }
  }

  complete(task: Task) {
    this.taskService.complete(task);
  }

  // ngOnInit() {
  //   this.route.queryParams.subscribe((params) => {
  //     const overlordId = params['currentOverlord'];
  //     this.handleOverlordIdAndTasks(overlordId);
  //   });
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['tasks'] && this.tasks) {
  //     const overlordId = this.route.snapshot.queryParams['currentOverlord'];
  //     this.handleOverlordIdAndTasks(overlordId);
  //   }
  // }

  // handleOverlordIdAndTasks(overlordId: number) {
  //   console.log('qr ' + overlordId);
  //   if (overlordId && this.tasks) {
  //     console.log('qweqwe    qweqweqw ' + this.tasks.length);
  //     this.currentOverlord = this.tasks.find(
  //       (task) => task.taskId === overlordId
  //     );
  //     if (this.currentOverlord) {
  //       console.log('qqq' + this.currentOverlord.name);
  //       this.onNext(this.currentOverlord);
  //     }
  //   } else {
  //     console.log('qr adawdawdawdawd' + overlordId);
  //   }
  // }

  updateUrlWithCurrentOverlord() {
    if (this.currentOverlord) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { currentOverlord: this.currentOverlord.taskId },
        queryParamsHandling: 'merge',
      });
    }
  }

  // ngOnInit() {
  //   // this.taskLoaderService.loadTasksSlow().subscribe({
  //   //   next: () => {
  //   //     console.log('Tasks loaded and updated in local storage');
  //   //     this.local.getAllTasks().subscribe((tasks: Task[]) => {
  //   //       if (tasks) {
  //   //         // if (!this.tasks) {
  //   //         // show latest task overlor...
  //   //         this.tasks = tasks;
  //   //         this.filtered = [...tasks];
  //   //         this.sortByPriority();
  //   //         console.log('FULL REFRESH');
  //   //         // to ensure on each update task (priority), we dont just get back to all tasks, but to current overlord (history)
  //   //         if (this.currentOverlord) {
  //   //           console.log('staying in: ' + this.currentOverlord.name);
  //   //           this.onNext(this.currentOverlord);
  //   //         }
  //   //         // }
  //   //       }
  //   //     });
  //   //   },
  //   // });
  // }

  refresh() {
    // refresh;
  }

  addChild(task: Task) {
    this.toggleVisibility(task);
  }

  getOverlords() {
    return this.filters.getOverlords(this.tasks);
  }

  onTaskCardClick(task: Task) {
    if (this.selectedTasks.has(task)) {
      this.selectedTasks.delete(task);
    } else {
      this.selectedTasks.add(task);
    }

    if (task) {
      this.selected.setSelectedTask(task);
    }
    // this.cdr.markForCheck();
  }

  isSelected(task: Task): boolean {
    return this.selectedTasks.has(task);
  }

  selectAll(): void {
    if (this.filtered) {
      this.filtered.forEach((task) => this.selectedTasks.add(task));
    }
    this.isAllSelected = true;
  }

  deselectAll(): void {
    this.selectedTasks.clear();
    this.isAllSelected = false;
  }

  clearSelection() {
    this.selectedTasks.clear();
    this.isAllSelected = false;
  }

  assignTasksToOverlord() {
    console.log(
      'Assigning tasks:',
      Array.from(this.selectedTasks),
      'to overlord:',
      this.selectedOverlord
    );
    const toUpdate: Task[] = Array.from(this.selectedTasks);
    toUpdate.forEach((t) => {
      if (this.selectedOverlord?.taskId) {
        t.overlord = this.selectedOverlord?.taskId;
      }
    });
    this.sync.updateTasks(toUpdate).subscribe();
  }

  getSelectedTasksAsArray(): Task[] {
    const arr = Array.from(this.selectedTasks);
    return arr;
  }

  // getSelectedTasksAsArray(): Task[] {
  //   const arr = Array.from(this.selectedTasks);
  //   return arr.slice();
  // }

  getFirstSelectedTask(): Task {
    const arr = Array.from(this.selectedTasks);
    return arr.length > 0 ? { ...arr[0] } : getDefaultTask();
  }

  onPrevious(task: Task) {
    if (!this.tasks) {
      return;
    }
    const overlordId = task.overlord;

    if (overlordId) {
      this.currentOverlord = task;
      this.selectedOverlordService.setSelectedOverlord(this.currentOverlord);
      this.updateUrlWithCurrentOverlord();

      const overlordTask = this.tasks.find((t) => t.taskId === overlordId);
      if (overlordTask) {
        const f = overlordTask.overlord
          ? this.tasks.filter((t) => t.overlord === overlordTask.overlord)
          : [overlordTask];

        this.setNewFiltered(f);
      }
    }
  }

  promote(task: Task) {
    this.taskService.increasePriority(task);
  }

  demote(task: Task) {
    this.taskService.decreasePriority(task);
  }

  onNext(task: Task) {
    console.log('task selected: ' + task.name);
    if (!this.tasks) {
      return;
    }

    this.currentOverlord = task;
    this.selectedOverlordService.setSelectedOverlord(this.currentOverlord);
    this.updateUrlWithCurrentOverlord();

    const f = this.tasks.filter((t) => t.overlord === task.taskId);
    if (f?.length > 0) {
      this.setNewFiltered(f);
    }
  }

  setNewFiltered(arr: Task[]) {
    this.filtered = [...arr];
    this.sortByPriority();
  }

  sortByPriority() {
    if (!this.filtered) return;
    this.filtered.sort((a, b) => {
      return b.priority - a.priority;
    });
  }
}
