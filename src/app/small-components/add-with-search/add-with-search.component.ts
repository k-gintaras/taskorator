import { Component, Input } from '@angular/core';
import { FeedbackService } from 'src/app/services/feedback.service';
import { LocalService } from 'src/app/services/local.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { SyncService } from 'src/app/services/sync.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { TaskOverlordFixerService } from 'src/app/services/task-overlord-fixer.service';
import { Task, getDefaultTask } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-add-with-search',
  templateUrl: './add-with-search.component.html',
  styleUrls: ['./add-with-search.component.scss'],
})
export class AddWithSearchComponent {
  searchTerm: string = '';
  tasks: Task[] | undefined;
  strict: boolean = false;

  newTask: Task = getDefaultTask();
  mostRecentTask: Task | undefined;

  filteredOverlordTasks: Task[] = [];
  itemSelected: boolean = false;

  constructor(
    private sync: SyncService,
    private local: LocalService,
    private selected: SelectedTaskService,
    private taskLoaderService: TaskLoaderService,
    private taskObjectHelper: TaskObjectHelperService,
    private taskOverlordFixer: TaskOverlordFixerService,
    private feedbackService: FeedbackService
  ) {}

  // ngOnInit() {
  //   this.sync.getAllTasks().subscribe((tasks) => {
  //     if (tasks) {
  //       this.tasks = tasks;
  //       this.filteredOverlordTasks = this.tasks;
  //       // console.log(this.tasks);
  //       // console.log(typeof this.tasks[0].timeCreated);
  //       // console.log(this.tasks[0].timeCreated);
  //       // assume you have a tasks list already loaded
  //       this.mostRecentTask = this.getMostRecentTask(this.tasks);
  //       this.newTask.overlord = this.mostRecentTask
  //         ? this.mostRecentTask.overlord
  //         : null;
  //       // console.log(
  //       //   this.mostRecentTask?.name ? this.mostRecentTask.name : 'recentTask'
  //       // );
  //     } else {
  //       console.error('Error fetching tasks:');
  //     }
  //   });
  // }

  createTask() {
    const newTask: Task = { ...this.newTask }; // Create a new task object

    if (!newTask.overlord) {
      // If overlord is not selected
      this.feedback('Please select an overlord for the task.', true);
      return;
    }

    if (newTask.name && newTask.name.length > 2) {
      // If you have other logic or API calls for task creation, place them here
      this.feedback(`Task: ${newTask.name} created.`, false);
      this.sync.createTask(newTask).subscribe();
    } else {
      this.feedback(
        'The task name should be at least 3 characters long.',
        true
      );
    }
  }

  // createTask() {
  //   console.log('most recent' + this.mostRecentTask);

  //   const newTask: Task = { ...this.newTask }; // Create a new task object
  //   if (this.mostRecentTask) {
  //     newTask.overlord = this.mostRecentTask.taskId;
  //   } else {
  //     newTask.overlord = 128;
  //   }
  //   if (newTask.name?.length > 2) {
  //     console.log(this.mostRecentTask);
  //     console.log(newTask.overlord);
  //     // this.sync.createTask(newTask).subscribe();
  //     this.feedback('Task: ' + newTask.name + ' created.', false);
  //   } else {
  //     this.feedback('bad task name', true);
  //   }
  // }

  getOverlordTasks(): Task[] {
    let filteredTasks = this.tasks;
    if (this.searchTerm && this.tasks) {
      filteredTasks = this.tasks.filter((task) =>
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (!filteredTasks) {
      return [];
    }

    if (this.strict) {
      const overlords = new Set(filteredTasks.map((task) => task.overlord));
      return filteredTasks.filter((task) => overlords.has(task.taskId));
    } else {
      return filteredTasks;
    }
  }

  getMostRecentTask(tasks: Task[] | undefined): Task | undefined {
    return tasks?.sort(
      (a, b) =>
        (b.timeCreated?.getTime() || 0) - (a.timeCreated?.getTime() || 0)
    )[0];
  }

  getBestMatchingTaskId(): string | undefined {
    if (!this.searchTerm && this.mostRecentTask !== null) {
      return this.mostRecentTask?.taskId;
    }

    const searchTermLower = this.searchTerm.trim().toLowerCase();

    if (searchTermLower && this.tasks) {
      const bestMatch = this.tasks.find((task) =>
        task.name.toLowerCase().includes(searchTermLower)
      );
      if (bestMatch) {
        this.feedback('Overlord Set: ' + bestMatch.name, true);

        return bestMatch.taskId;
      }
    }

    return;
  }

  onOverlordChange(t: Task) {
    if (t !== null) {
      this.mostRecentTask = t;
      if (this.mostRecentTask.name) {
        this.feedback('Overlord Set: ' + this.mostRecentTask.name, false);
      }
    }
  }

  feedback(s: string, isError: boolean) {
    this.feedbackService.sendFeedback(s, isError);
  }

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

  getSelectedOverlord() {
    if (!this.tasks) return;
    return this.taskObjectHelper.getOverlord(this.newTask, this.tasks)?.name;
  }
}
