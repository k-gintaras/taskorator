import { Component } from '@angular/core';
import { Task, getDefaultTask } from '../task-model/taskModelManager';
import { LocalService } from '../services/local.service';
import { SelectedTaskService } from '../services/selected-task.service';
import { SyncService } from '../services/sync.service';
import { TaskLoaderService } from '../services/task-loader.service';
import { TaskObjectHelperService } from '../services/task-object-helper.service';
import { TaskOverlordFixerService } from '../services/task-overlord-fixer.service';
@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
})
// FIXME: it is probably not used anymore
export class TaskViewComponent {
  tasks: Task[] = [];
  isDbOnline: boolean = false;
  selectedTask: Task | undefined;
  subTask: Task | undefined;
  showArchivedTasks = false;

  constructor(
    private sync: SyncService,
    private local: LocalService,
    private selected: SelectedTaskService,
    private taskLoaderService: TaskLoaderService,
    private taskObjectHelper: TaskObjectHelperService,
    private taskOverlordFixer: TaskOverlordFixerService
  ) {}
  ngOnInit() {
    this.taskLoaderService.loadTasks();

    this.local.getAllTasks().subscribe((tasks) => {
      if (tasks) {
        this.tasks = tasks;
        console.log(this.tasks.length);
      } else {
        console.error('Error fetching tasks:');
      }
    });

    // this.taskLoaderService.loadTasksSlow().subscribe({
    //   next: () => {
    //     console.log('Tasks loaded and updated in local storage');
    //     // You can perform further actions after tasks are loaded and updated
    //   },
    //   error: (error) => {
    //     console.error('Failed to load tasks:', error);
    //     // Handle the error if tasks fail to load
    //   },
    // });
  }

  toggleShowArchived() {
    this.showArchivedTasks = !this.showArchivedTasks;
  }

  // updateAllTasks() {
  //   const fixedTasks = this.taskOverlordFixer.fixEscapes(this.tasks);
  //   fixedTasks.forEach((t) => {
  //     if (t.name)
  //     this.sync.updateTask(t).subscribe((res) => {
  //       if (res) {
  //       }
  //     });
  //   });
  // }

  selectTask(task: Task) {
    this.selectedTask = task;
    this.selected.setSelectedTask(task);
  }

  selectSubTask(task: Task) {
    this.subTask = task;
  }

  deleteTask(task: Task) {
    console.log('Deleting: ' + task.name);
    // we will instead be setting statys as deleted:

    // // this.sync.deleteTask(task.taskId).subscribe();
    // task.stage = 'deleted';
    // this.sync.updateTask(task).subscribe();
    // this.local.deleteTask(task.taskId).subscribe();
    // this.selectedTask = task;
    // this.selected.setSelectedTask(task);
  }

  archiveTask(task: Task) {
    console.log('Archiving: ' + task.name);
    // we will instead be setting statys as deleted:

    // this.sync.deleteTask(task.taskId).subscribe();
    task.stage = 'archived';
    this.sync.updateTask(task).subscribe();
    // this.local.deleteTask(task.taskId).subscribe();
    // this.selectedTask = task;
    // this.selected.setSelectedTask(task);
  }

  renewTask(task: Task) {
    console.log('Archiving: ' + task.name);
    // we will instead be setting statys as deleted:

    // this.sync.deleteTask(task.taskId).subscribe();
    task.stage = 'todo';
    this.sync.updateTask(task).subscribe();
    // this.local.deleteTask(task.taskId).subscribe();
    // this.selectedTask = task;
    // this.selected.setSelectedTask(task);
  }

  getOverlordName(id: string | null) {
    if (id) {
      return this.taskObjectHelper.getTaskById(id, this.tasks)?.name;
    }
    return '';
  }

  filterByOverlord(): Task[] | null {
    if (this.selectedTask) {
      return this.taskObjectHelper.getTasksByOverlordId(
        this.selectedTask.taskId,
        this.tasks
      );
    }
    return null;
  }

  // filterByOverlordName(): Task[] | null {
  //   if (this.selectedTask) {
  //     return this.taskObjectHelper.getTasksByOverlordIdName(
  //       this.selectedTask.name,
  //       this.tasks
  //     );
  //   }
  //   return null;
  // }
}
