import { Component, OnInit } from '@angular/core';
import { Task } from '../../../../../models/taskModelManager';
import { TaskListService } from '../../../../../services/task/task-list/task-list.service';
import { TaskListComponent } from '../../task-list/task-list.component';

@Component({
  selector: 'app-weekly-task-list',
  standalone: true,
  imports: [TaskListComponent],
  templateUrl: './weekly-task-list.component.html',
  styleUrl: './weekly-task-list.component.scss',
})
export class WeeklyTaskListComponent implements OnInit {
  tasks: Task[] | null = null;

  constructor(private taskListService: TaskListService) {}

  async ngOnInit() {
    this.tasks = await this.taskListService.getWeeklyTasks();
  }
}
