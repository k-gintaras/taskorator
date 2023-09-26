import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SyncService } from 'src/app/services/sync.service';
import { TaskService } from 'src/app/services/task.service';
import {
  ExtendedTask,
  getDefaultEditTask,
} from 'src/app/task-model/massTaskEditModel';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-mass-editor',
  templateUrl: './mass-editor.component.html',
  styleUrls: ['./mass-editor.component.css'],
})
export class MassEditorComponent {
  @Input() task: ExtendedTask = this.getDefaultExtendedTask();
  @Input() tasks: ExtendedTask[] = [];
  @Input() overlords: Task[] | undefined = [];
  filteredOverlordTasks: Task[] = [];

  constructor(private taskService: SyncService) {}

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['tasks'] && this.tasks.length > 0) {
  //     this.setToTask(this.tasks[0]);
  //   }
  // }

  ngOnInit() {
    // this.toggleOverlordsTasks(null);
    // if (!this.task) {
    //   this.task = getDefaultEditTask();
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.task) {
      this.task = getDefaultEditTask();
    }
  }

  // unsetTask() {
  //   this.task = this.getDefaultExtendedTask();
  //   this.isTaskSetInitially = false;
  // }

  // ngOnInit() {
  //   if (this.tasks.length === 1) {
  //     this.setToTask(this.tasks[0]);
  //   }
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['tasks'] && this.tasks.length === 1) {
  //     this.setToTask(this.tasks[0]);
  //   }
  // }

  setToTask(task: Task | ExtendedTask) {
    console.log('Setting task: ', task); // debug log to inspect the task being set
    this.task = { ...task } as ExtendedTask;
  }

  dateToString(date: Date | null): string | null {
    return date ? date.toISOString().substring(0, 16) : null;
  }

  stringToDate(dateString: string | null): Date | null {
    return dateString ? new Date(dateString) : null;
  }

  taskChanged() {}

  saveOne() {
    this.taskService.updateTask(this.task).subscribe();
  }

  create() {
    this.taskService.createTask(this.task).subscribe();
  }

  createParentAndAdd() {}

  filterOverlordTasks(event: any) {
    const searchTerm = event.term;
    if (this.tasks) {
      if (searchTerm) {
        this.filteredOverlordTasks = this.tasks.filter((task) =>
          task.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        this.filteredOverlordTasks = this.tasks;
      }
    }
  }

  save2() {
    if (this.tasks.length > 0) {
      this.tasks.forEach((task) => {
        if (this.task.nameEdit) {
          task.name = this.task.name;
        }
        if (this.task.todoEdit) {
          task.todo = this.task.todo;
        }
        if (this.task.whyEdit) {
          task.why = this.task.why;
        }
        if (this.task.timeCreatedEdit) {
          task.timeCreated = this.task.timeCreated;
        }
        if (this.task.lastUpdatedEdit) {
          task.lastUpdated = this.task.lastUpdated;
        }
        if (this.task.timeEndEdit) {
          task.timeEnd = this.task.timeEnd;
        }
        if (this.task.durationEdit) {
          task.duration = this.task.duration;
        }
        if (this.task.overlordEdit) {
          task.overlord = this.task.overlord;
        }
        if (this.task.repeatEdit) {
          task.repeat = this.task.repeat;
        }
        if (this.task.statusEdit) {
          task.status = this.task.status;
        }
        if (this.task.stageEdit) {
          task.stage = this.task.stage;
        }
        if (this.task.typeEdit) {
          task.type = this.task.type;
        }
        if (this.task.subtypeEdit) {
          task.subtype = this.task.subtype;
        }
        if (this.task.sizeEdit) {
          task.size = this.task.size;
        }
        if (this.task.ownerEdit) {
          task.owner = this.task.owner;
        }
        if (this.task.priorityEdit) {
          task.priority = this.task.priority;
        }
        if (this.task.backupLinkEdit) {
          task.backupLink = this.task.backupLink;
        }
        if (this.task.imageUrlEdit) {
          task.imageUrl = this.task.imageUrl;
        }
        if (this.task.imageDataUrlEdit) {
          task.imageDataUrl = this.task.imageDataUrl;
        }
        if (this.task.tagsEdit) {
          task.tags = this.task.tags;
        }
      });
      this.taskService.updateTasks(this.tasks).subscribe();
    }
  }

  saveSingleTask(taskToUpdate: Task, editableTask: Task) {
    Object.keys(taskToUpdate).forEach((key) => {
      const editKey = `${key}Edit` as keyof typeof editableTask;
      if (editableTask[editKey]) {
        (taskToUpdate as any)[key] =
          editableTask[key as keyof typeof editableTask];
      }
    });
  }

  save() {
    if (this.tasks.length > 0) {
      this.tasks.forEach((task) => {
        this.saveSingleTask(task, this.task);
      });
      this.taskService.updateTasks(this.tasks).subscribe();
    }
  }

  getDefaultExtendedTask(): ExtendedTask {
    return getDefaultEditTask();
  }
}
