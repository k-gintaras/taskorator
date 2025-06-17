import { Component, OnInit } from '@angular/core';
import { getDefaultTask, TaskoratorTask } from '../../models/taskModelManager';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { TaskListService } from '../../services/sync-api-cache/task-list.service';
import { SearchCreateComponent } from '../../components/search-create/search-create.component';
import { SessionManagerService } from '../../services/session-manager.service';
import { LatestCreatedTaskListComponent } from '../core/sentinel/lists/latest-created-task-list/latest-created-task-list.component';

@Component({
  selector: 'app-next-task-manager',
  templateUrl: './next-task-manager.component.html',
  styleUrls: ['./next-task-manager.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    LatestCreatedTaskListComponent,
    SearchCreateComponent,
  ],
})
export class NextTaskManagerComponent implements OnInit {
  newTaskName: string = '';
  latestNextTasks: TaskoratorTask[] = [];
  initialized: boolean = false;

  constructor(
    private taskService: TaskUpdateService,
    private taskListService: TaskListService,
    private sessionManager: SessionManagerService
  ) {}

  async ngOnInit() {
    this.initialized = await this.sessionManager.waitForInitialization();

    console.log('Session is ready:', this.sessionManager.getSessionType());
    // Your component logic here
    this.fetchLatestNextTasks();
  }

  createNextTask(): void {
    const newTask: TaskoratorTask = getDefaultTask();

    (newTask.name = this.newTaskName),
      (newTask.type = 'next'),
      this.taskService.create(newTask);
    this.newTaskName = '';
    // TODO: consider on register create base tasks that are often used, not just root
    // 127: tasks
    // 129 daily tasks
    // ???
    // this.taskService.createTask(newTask).then(() => {
    //   this.newTaskName = ''; // Reset input field
    // });
  }

  fetchLatestNextTasks(): void {
    // TODO: USE TASK LIST SIMPLE SERVICE (WHY ??? don't remember)
    this.taskListService.getLatestTasks().then((tasks) => {
      if (!tasks) return;
      this.latestNextTasks = tasks;
    });
  }
}
