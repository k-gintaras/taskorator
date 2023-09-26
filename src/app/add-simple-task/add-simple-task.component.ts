import { Component, Input } from '@angular/core';
import { Task, getDefaultTask } from '../task-model/taskModelManager';
import { LocalService } from '../services/local.service';
import { SyncService } from '../services/sync.service';

@Component({
  selector: 'app-add-simple-task',
  templateUrl: './add-simple-task.component.html',
  styleUrls: ['./add-simple-task.component.scss'],
})
export class AddSimpleTaskComponent {
  tasks: Task[] = [];
  newTask: Task = getDefaultTask();
  @Input() overlord: Task | undefined;

  constructor(private sync: SyncService) {}

  ngOnInit() {
    this.sync.getAllTasks().subscribe((tasks) => {
      if (tasks) {
        this.tasks = tasks;
        // console.log(this.tasks);
        console.log(typeof this.tasks[0].timeCreated);
        console.log(this.tasks[0].timeCreated);
        // assume you have a tasks list already loaded
        const mostRecentTask = this.getMostRecentTask(this.tasks);
        this.newTask.overlord = mostRecentTask ? mostRecentTask.overlord : null;
        console.log(mostRecentTask?.name ? mostRecentTask.name : 'recentTask');
      } else {
        console.error('Error fetching tasks:');
      }
    });
  }
  // Method to create a new task
  createTask() {
    console.log(this.newTask);
    const newTask: Task = { ...this.newTask }; // Create a new task object
    if (!newTask.overlord) {
      newTask.overlord = 128;
    }
    this.sync.createTask(newTask).subscribe();
  }

  getOverlordTasks(tasks: Task[] | undefined): Task[] | undefined {
    const childrenOverlords = new Set(tasks?.map((task) => task.overlord));
    return tasks?.filter((task) => childrenOverlords.has(task.taskId));
  }

  getMostRecentTask(tasks: Task[] | undefined): Task | undefined {
    return tasks?.sort(
      (a, b) =>
        (b.timeCreated?.getTime() ?? 0) - (a.timeCreated?.getTime() ?? 0)
    )[0];
  }
}
