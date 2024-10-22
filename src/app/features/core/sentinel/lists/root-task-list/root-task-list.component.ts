import { Component, OnInit } from '@angular/core';
import { Task, ROOT_TASK_ID } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { TaskListComponent } from '../../task-list/task-list.component';

@Component({
  selector: 'app-root-task-list',
  standalone: true,
  imports: [TaskListComponent],
  templateUrl: './root-task-list.component.html',
  styleUrl: './root-task-list.component.scss',
})
export class RootTaskListComponent implements OnInit {
  tasks: Task[] | null = null;

  constructor(private taskListService: TaskListService) {}

  async ngOnInit() {
    this.tasks = await this.taskListService.getOverlordTasks(ROOT_TASK_ID);
  }
}
