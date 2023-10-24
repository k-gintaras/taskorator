import { Component, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-task-browser',
  templateUrl: './task-browser.component.html',
  styleUrls: ['./task-browser.component.css'],
})
export class TaskBrowserComponent {
  // @Input() tasks: Task[] | undefined;
  @Input() filtered: Task[] | null = [];
  // @Input() tasks$: Observable<Task[]> = new Observable<Task[]>();
  @Input() tasks: Task[] = [];

  // tasks: Task[] | null = [];
  @Input() selectedOverlord: Task | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private selectedOverlordService: SelectedOverlordService,
    private f: FeedbackService,
    private taskObjectService: TaskObjectHelperService
  ) {}

  ngOnInit() {
    // combineLatest([
    //   this.selectedOverlordService.getSelectedOverlord(),
    //   this.tasks$,
    // ]).subscribe(([selectedOverlord, newTasks]) => {
    //   if (selectedOverlord) {
    //     this.selectedOverlord = selectedOverlord;
    //     console.log('previous overlord::::: ' + selectedOverlord.name);
    //   }

    //   if (newTasks) {
    //     // this.tasks = newTasks;
    //     // this.filtered = newTasks;

    //     if (this.selectedOverlord) {
    //       const f = this.tasks.filter(
    //         (t) => t.overlord === this.selectedOverlord!.taskId
    //       );

    //       if (f?.length > 0) {
    //         this.setNewFiltered(f);
    //       }
    //     }
    //   } else {
    //     console.log('qq');
    //   }
    // });

    this.selectedOverlordService
      .getSelectedOverlord()
      .subscribe((selectedOverlord) => {
        console.log('overlord UPDATED: ');
        if (selectedOverlord) {
          console.log('qq pewpew ' + selectedOverlord.name);

          this.selectedOverlord = selectedOverlord;
          const f = this.tasks.filter(
            (t) => t.overlord === this.selectedOverlord!.taskId
          );

          if (f?.length > 0) {
            this.setNewFiltered(f);
          }
        }
      });
  }
  // ngOnInit() {
  //   this.selectedOverlordService.getSelectedOverlord().subscribe((o) => {
  //     if (o) {
  //       this.selectedOverlord = o;
  //       console.log('previous ovelord::::: ' + o.name);
  //       if (this.tasks) {
  //         const f = this.tasks.filter((t) => t.overlord === o.taskId);
  //         if (f?.length > 0) {
  //           this.setNewFiltered(f);
  //         }
  //       }
  //     }
  //   });
  //   this.tasks$.subscribe((newTasks) => {
  //     this.tasks = newTasks;
  //     this.filtered = newTasks;
  //   });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.tasks) {
      if (this.selectedOverlord) {
        this.onNext(this.selectedOverlord);
      }
    }
  }

  isSelected(task: Task) {}

  onPrevious(task: Task) {
    if (!this.tasks) {
      return;
    }

    console.log('Task to find the overlord of:', task); // Debug line

    const overlordId = task.overlord;

    if (overlordId) {
      const overlordTask = this.tasks.find((t) => t.taskId === overlordId);
      console.log('Found overlord task:', overlordTask); // Debug line

      if (overlordTask) {
        this.selectedOverlord = overlordTask;
        this.selectedOverlordService.setSelectedOverlord(this.selectedOverlord);

        const f = this.tasks.filter(
          (t) => t.overlord === overlordTask.overlord
        );
        console.log('Filtered tasks for previous step:', f); // Debug line

        if (f?.length > 0) {
          this.setNewFiltered(f);
        }
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
      this.f.log('No more tasks inside.');
      // TODO: what to show when there is no more tasks, create child???
      // Reached the root task, handle accordingly.
      // You can either stop the navigation or do something else here.
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

  selectedOverlordUpdate(task: Task) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { selectedOverlord: task.taskId },
      queryParamsHandling: 'merge',
    });
    // this.selectedOverlord = task;
    // this.selectedOverlordService.setSelectedOverlord(this.selectedOverlord);
  }

  promote(task: Task) {}

  onTaskCardClick(task: Task) {
    // set selected...
  }

  getOverlord(task: Task) {
    if (!this.tasks) return task;
    return this.taskObjectService.getOverlord(task, this.tasks);
  }

  complete(task: Task) {}
  addChild(task: Task) {}
  demote(task: Task) {}
}
