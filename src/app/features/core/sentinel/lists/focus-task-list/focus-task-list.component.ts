import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { TaskListComponent } from '../../task-list/task-list.component';

@Component({
  selector: 'app-focus-task-list',
  standalone: true,
  imports: [TaskListComponent],
  templateUrl: './focus-task-list.component.html',
  styleUrl: './focus-task-list.component.scss',
})
export class FocusTaskListComponent implements OnInit {
  tasks: Task[] | null = null;

  constructor(private taskListService: TaskListService) {}

  async ngOnInit() {
    this.tasks = await this.taskListService.getFocusTasks();
  }
}
