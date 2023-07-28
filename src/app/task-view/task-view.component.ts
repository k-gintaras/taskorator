import { Component } from '@angular/core';
import { TaskService } from 'src/task.service';
import { Task, getDefaultTask } from '../task-model/taskModelManager';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.css'],
})
export class TaskViewComponent {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getAllTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
        console.log(this.tasks);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );

    const task: Task = getDefaultTask();
    // this.taskService.createTask(task).subscribe();
    console.log('works');
  }
}
