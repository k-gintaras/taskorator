import { Component, OnInit } from '@angular/core';
import { getDefaultTask, TaskoratorTask } from '../../models/taskModelManager';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { TaskListService } from '../../services/sync-api-cache/task-list.service';
import { SearchCreateComponent } from '../../components/search-create/search-create.component';
import { AuthStateManagerService } from '../../services/auth-state-manager.service';
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
    private authStateManager: AuthStateManagerService
  ) {}

  async ngOnInit() {
    // Wait for the AuthStateManager to ensure all services are initialized
    await this.authStateManager.ensureInitialized();
    
    console.log('Auth state is ready, user authenticated:', this.authStateManager.isAuthenticated());
    
    // Now it's safe to fetch tasks since the API is properly initialized
    this.fetchLatestNextTasks();
    this.initialized = true;
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
