import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { TaskListComponent } from '../../task-list/task-list.component';

@Component({
  selector: 'app-latest-updated-task-list',
  standalone: true,
  imports: [TaskListComponent],
  templateUrl: './latest-updated-task-list.component.html',
  styleUrl: './latest-updated-task-list.component.scss',
})
export class LatestUpdatedTaskListComponent implements OnInit {
  tasks: Task[] | null = null;

  constructor(private taskListService: TaskListService) {}

  async ngOnInit() {
    this.tasks = await this.taskListService.getLatestUpdatedTasks();
  }
}
