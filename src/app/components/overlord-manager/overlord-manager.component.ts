import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FilterHelperService } from 'src/app/services/filter-helper.service';
import { LocalService } from 'src/app/services/local.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { SyncService } from 'src/app/services/sync.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task, getDefaultTask } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-overlord-manager',
  templateUrl: './overlord-manager.component.html',
  styleUrls: ['./overlord-manager.component.scss'],
})
// FIXME: it is probably not used anymore
export class OverlordManagerComponent implements OnInit {
  tasks: Task[] = [];
  overlord: Task | undefined;
  overlord2: Task | undefined;
  newTask: Task = getDefaultTask();
  filterType = true;

  selectedOverlordId: string | null = null;
  selectedOverlordId2: string | null = null;

  constructor(
    private sync: SyncService,
    private local: LocalService,
    private selected: SelectedTaskService,
    private taskLoaderService: TaskLoaderService,
    private taskObjectHelper: TaskObjectHelperService,
    private filters: FilterHelperService
  ) {}
  ngOnInit() {
    this.taskLoaderService.loadTasks();

    this.local.getAllTasks().subscribe((tasks) => {
      if (tasks) {
        this.tasks = tasks;
        console.log(this.tasks.length);
        this.tasks.forEach((t) => {
          console.log(typeof t.priority);
        });
      } else {
        console.error('Error fetching tasks:');
      }
    });
  }

  toggleOverlordFilter(overlordId: string | null | undefined) {
    if (overlordId === undefined) {
      this.selectedOverlordId = null;
    } else {
      this.selectedOverlordId =
        this.selectedOverlordId === overlordId ? null : overlordId;
    }
  }

  toggleOverlordFilter2(overlordId: string | null | undefined) {
    if (overlordId === undefined) {
      this.selectedOverlordId2 = null;
    } else {
      this.selectedOverlordId2 =
        this.selectedOverlordId2 === overlordId ? null : overlordId;
    }
  }

  getTasksForOverlord(overlordId: string | null): Task[] {
    const filtered = this.filters.getOverlords(this.tasks);
    if (filtered) {
      return filtered;
    }
    if (overlordId === null) {
      return this.tasks; // Show all tasks if there is no selected overlord
    }

    return this.tasks.filter((task) => task.overlord === overlordId);
  }

  getTasksForOverlord2(overlordId: string | null): Task[] {
    if (overlordId === null) {
      return this.tasks; // Show all tasks if there is no selected overlord
    }

    // return this.taskObjectHelper.getTasksByNoOverlordIdAndItself(
    //   this.overlord.taskId,
    //   this.tasks
    // );
    // (task) =>
    //   task.overlord !== overlordId && task.taskId !== overlordId;

    return this.tasks.filter((task) => task.overlord === overlordId);
  }

  createTask() {
    console.log(this.newTask);
    const newTask: Task = { ...this.newTask }; // Create a new task object
    if (newTask.overlord === '0') {
      newTask.overlord = '128';
    }
    this.sync.createTask(newTask).subscribe();
  }

  selectTask(task: Task) {
    this.overlord = task;
    this.selected.setSelectedTask(task);
  }

  selectTask2(task: Task) {
    this.overlord2 = task;
    // this.selected.setSelectedTask(task);
  }

  filterByOverlord(): Task[] | null {
    // we will do it later, where overlord
    if (this.overlord) {
      return this.taskObjectHelper.getTasksByOverlordId(
        this.overlord.taskId,
        this.tasks
      );
    }
    return null;
  }

  filterByNoOverlord(): Task[] | null {
    // we will do it later, where overlord
    if (this.overlord) {
      return this.taskObjectHelper.getTasksByNoOverlordIdAndItself(
        this.overlord.taskId,
        this.tasks
      );
    }
    return null;
  }

  getOverlordName(id: string | null) {
    if (id) {
      return this.taskObjectHelper.getTaskById(id, this.tasks)?.name;
    }
    return '';
  }

  setOverlord(task: Task) {
    if (task && this.overlord) {
      console.log(task);
      task.overlord = this.overlord.taskId;
      //this.sync.updateTask(task).subscribe();
    }
  }

  freeOverlord(task: Task) {
    if (task && this.overlord) {
      task.overlord = '128';
      //this.sync.updateTask(task).subscribe();
    }
  }
}
