import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilterHelperService } from 'src/app/services/filter-helper.service';
import { LocalService } from 'src/app/services/local.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import {
  Task,
  TaskSize,
  TaskStage,
  TaskStatus,
  RepeatOptions,
  TaskType,
  TaskSubtype,
} from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.component.html',
  styleUrls: ['./task-filter.component.css'],
})
export class TaskFilterComponent {
  @Input() tasks: Task[] | undefined;
  filtered: Task[] = [];
  overlords: Task[] = [];
  @Output() onFilter = new EventEmitter<Task[]>();
  isFilterCompleted = true;

  // select
  size: TaskSize | '' = '';
  stage: TaskStage | '' = '';
  status: TaskStatus | '' = '';
  repeat: RepeatOptions | '' = '';
  type: TaskType | '' = '';
  subtype: TaskSubtype | '' = '';

  // search
  name: string | '' = '';
  todo: string | '' = '';
  why: string | '' = '';
  owner: string | '' = '';
  tags: string | '' = ''; //  we just let search for 1 tag at a time for now

  // sort

  sortField: string = '';
  sortOrder: string = 'desc';

  priority: number = 0; // make no sense, just sort it by that
  timeCreated: Date = new Date();
  lastUpdated: Date = new Date();
  timeEnd: Date = new Date();
  duration: number = 0;

  // other
  // select by overlors by no overlord... ladadee ladada
  overlord: number = 0;

  // reasoning and referencing:
  // no need // taskId: number; // Unique identifier for the task
  // search // name: string;
  // search // todo: string;
  // search // why: string;
  // sort // timeCreated: Date; // Creation time of the task (JavaScript Date object)
  // sort // lastUpdated: Date | null;
  // sort // timeEnd: Date | null; // Completion time of the task (JavaScript Date object or null if not completed)
  // sort // duration: number; // Estimated time to complete the task in minutes or hours
  // other // overlord: number | null | string; // taskId of the parent task if it's part of a hierarchy
  // select // repeat: RepeatOptions;
  // select // status: TaskStatus; // Task status options
  // select // stage: TaskStage; // Task stage options
  // select // type: TaskType;
  // select // subtype: TaskSubtype;
  // select // size: TaskSize; // we can delegate this to another owner or something
  // search // owner: string; // for future use of who does whose tasks
  // sort // priority: number; // Task priority (1 to 10, for example)
  // no need // backupLink: string; // github, file location, web link, nothing
  // no need // imageUrl: string | null; // URL to the image file
  // no need // imageDataUrl: string | null; // Base64 representation of the image
  // search // tags: string[]; // Array of tags associated with the task

  constructor(
    private taskLoaderService: TaskLoaderService,
    private local: LocalService,
    private filters: FilterHelperService
  ) {}

  ngOnInit() {
    this.taskLoaderService.loadTasksSlow().subscribe({
      next: () => {
        console.log('Tasks loaded and updated in local storage');
        this.local.getAllTasks().subscribe((tasks: Task[]) => {
          if (tasks) {
            // if (!this.tasks) {
            // show latest task overlor...
            this.tasks = tasks;
            this.filterTasks();
            this.filterOverlords();
            this.filterCompleted();
            this.sortTasks('priority');
            // this.filtered = [...tasks];
            // this.sortByPriority();
            // console.log('FULL REFRESH');
          }
          // }
        });
      },
    });
  }

  filterCompleted() {
    if (this.isFilterCompleted) {
      this.filtered = this.filtered.filter((task: Task) => {
        return (
          task.stage !== 'completed' &&
          task.stage !== 'archived' &&
          task.stage !== 'deleted'
        );
      });
    }
  }

  filterOverlords() {
    // this.filters.getOverlords(this.tasks);
    // this.filters.getSemiOverlords(this.tasks);
    this.overlords = this.local.getTaskTree().getOverlords();
    // console.log(this.overlords);
    // this.local.getAllTasks().subscribe((tasks: Task[]) => {
    //   console.log(tasks.length);
    //   console.log(tasks.length);
    // });

    // console.log(this.local.getTaskTree());
  }

  filterTasks() {
    if (!this.tasks) return;
    const filteredTasks = this.tasks.filter((task) => {
      //console.log(task.name + ' ' + task.tags);
      return (
        (this.size ? task.size === this.size : true) &&
        (this.stage ? task.stage === this.stage : true) &&
        (this.status ? task.status === this.status : true) &&
        (this.repeat ? task.repeat === this.repeat : true) &&
        (this.type ? task.type === this.type : true) &&
        (this.subtype ? task.subtype === this.subtype : true) &&
        this.isIn(this.owner, task.owner) &&
        this.isIn(this.name, task.name) &&
        this.isIn(this.todo, task.todo) &&
        this.isIn(this.why, task.why) &&
        this.isInArr(this.tags, task.tags)
      );
    });

    this.filtered = filteredTasks;
    this.onFilter.emit(filteredTasks);
  }

  // isIn(s1: string, s2: string): boolean {
  //   if (s1 === null || s1 === '') return true;
  //   if (!s2) return false;
  //   return s2.toLowerCase().includes(s1.toLowerCase());

  //   // return s1 ? s2.toLowerCase().includes(s1.toLowerCase()) : true;
  // }

  isIn(s1: string, s2: string | null): boolean {
    if (s1 === '' || s1 === null) return true;
    if (s2 === '' || s2 === null) return false;
    return s2.toLowerCase().includes(s1.toLowerCase());
  }

  isInArr(s1: string, s2: string[]): boolean {
    if (s1 === '' || s1 === null) return true;
    if (!Array.isArray(s2) || s2 === null) return false;
    return s2.join(',').toLowerCase().includes(s1.toLowerCase());
  }

  sortTasks(field: string) {
    this.sortField = field;
    this.filtered = [...this.filtered].sort((a, b) => {
      const getValue = (task: any, field: string) => {
        const value = task[field];
        if (value === null) {
          return this.sortOrder === 'asc'
            ? new Date(8640000000000000)
            : new Date(0);
        }
        return value;
      };

      switch (this.sortField) {
        case 'priority':
          return this.sortOrder === 'asc'
            ? a.priority - b.priority
            : b.priority - a.priority;
        case 'duration':
          return this.sortOrder === 'asc'
            ? a.duration - b.duration
            : b.duration - a.duration;
        case 'timeCreated':
          return this.sortOrder === 'asc'
            ? getValue(a, 'timeCreated').getTime() -
                getValue(b, 'timeCreated').getTime()
            : getValue(b, 'timeCreated').getTime() -
                getValue(a, 'timeCreated').getTime();
        case 'lastUpdated':
          return this.sortOrder === 'asc'
            ? getValue(a, 'lastUpdated').getTime() -
                getValue(b, 'lastUpdated').getTime()
            : getValue(b, 'lastUpdated').getTime() -
                getValue(a, 'lastUpdated').getTime();
        case 'timeEnd':
          return this.sortOrder === 'asc'
            ? getValue(a, 'timeEnd').getTime() -
                getValue(b, 'timeEnd').getTime()
            : getValue(b, 'timeEnd').getTime() -
                getValue(a, 'timeEnd').getTime();
        default:
          return 0;
      }
    });
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortTasks(this.sortField);
  }
}
