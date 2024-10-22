import { Component, NgModule, OnInit } from '@angular/core';
import { getDefaultTask, Task } from '../../models/taskModelManager';
import { TaskService } from '../../services/task/task.service';
import { TaskListService } from '../../services/task/task-list/task-list.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-next-task-manager',
  templateUrl: './next-task-manager.component.html',
  styleUrls: ['./next-task-manager.component.scss'],
  standalone: true,
  imports: [FormsModule, NgFor],
})
export class NextTaskManagerComponent implements OnInit {
  newTaskName: string = '';
  latestNextTasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private taskListService: TaskListService
  ) {}

  ngOnInit(): void {
    this.fetchLatestNextTasks();
  }

  createNextTask(): void {
    const newTask: Task = getDefaultTask();

    (newTask.name = this.newTaskName),
      (newTask.type = 'next'),
      this.taskService.createTask(newTask).then(() => {
        this.newTaskName = ''; // Reset input field
      });
  }

  fetchLatestNextTasks(): void {
    this.taskListService.getLatestTasks().then((tasks) => {
      if (!tasks) return;
      this.latestNextTasks = tasks;
    });
  }
}
