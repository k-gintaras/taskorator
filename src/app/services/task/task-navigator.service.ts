import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { Task } from 'src/app/models/taskModelManager';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBusService } from '../core/event-bus.service';
import { CoreService } from '../core/core.service';
import { ConfigService } from '../core/config.service';

export interface TaskNavigationView {
  taskOverlord: Task;
  taskChildren: Task[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorService extends CoreService {
  private taskNavigationViewSubject: BehaviorSubject<TaskNavigationView | null> =
    new BehaviorSubject<TaskNavigationView | null>(null);

  constructor(
    private taskService: TaskService,
    private eventBusService: EventBusService,
    configService: ConfigService
  ) {
    super(configService);
    this.subscribeToTaskEvents();
  }

  private subscribeToTaskEvents(): void {
    this.eventBusService.onEvent<Task>('createTask').subscribe((task) => {
      this.handleTaskCreated(task);
    });
    this.eventBusService.onEvent<Task[]>('createTasks').subscribe((tasks) => {
      this.handleTasksCreated(tasks);
    });
    this.eventBusService.onEvent<Task>('updateTask').subscribe((task) => {
      this.handleTaskUpdated(task);
    });
    this.eventBusService.onEvent<Task[]>('updateTasks').subscribe((tasks) => {
      this.handleTasksUpdated(tasks);
    });
  }

  async loadTaskNavigationView(overlordId: string): Promise<void> {
    const overlord = await this.taskService.getTaskById(overlordId);
    if (overlord) {
      const children = await this.taskService.getOverlordChildren(overlordId);
      this.setTaskNavigationView(overlord, children || []);
    } else {
      console.log('no overlord?');
    }
  }

  private async handleTaskCreated(task: Task): Promise<void> {
    const currentView = this.taskNavigationViewSubject.value;
    if (currentView) {
      if (task.overlord === currentView.taskOverlord.taskId) {
        // The created task belongs to the current task overlord
        const updatedChildren = [...currentView.taskChildren, task];
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
      } else {
        // The created task belongs to a different overlord
        // Check if the current view needs to be updated
        if (!task.overlord)
          throw new Error("Can't check overlord null @handleTaskCreated");
        const overlord = await this.taskService.getTaskById(task.overlord);
        if (overlord && overlord.overlord === currentView.taskOverlord.taskId) {
          // The created task's overlord is a child of the current view's overlord
          const updatedChildren = [...currentView.taskChildren];
          const index = updatedChildren.findIndex(
            (child) => child.taskId === overlord.taskId
          );
          if (index !== -1) {
            updatedChildren[index] = overlord;
            this.setTaskNavigationView(
              currentView.taskOverlord,
              updatedChildren
            );
          }
        }
      }
    }
  }

  private async handleTaskUpdated(task: Task): Promise<void> {
    const currentView = this.taskNavigationViewSubject.value;
    if (currentView) {
      if (task.overlord === currentView.taskOverlord.taskId) {
        const updatedChildren = currentView.taskChildren.map((child) =>
          child.taskId === task.taskId ? task : child
        );
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
      } else {
        // The updated task has a new overlord
        // Remove the task from the current view's children
        const updatedChildren = currentView.taskChildren.filter(
          (child) => child.taskId !== task.taskId
        );
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
        // Check if the new overlord is a child of the current view's overlord
        if (!task.overlord)
          throw new Error("Can't check overlord null @handleTaskUpdated");
        const overlord = await this.taskService.getTaskById(task.overlord);
        if (overlord && overlord.overlord === currentView.taskOverlord.taskId) {
          const index = updatedChildren.findIndex(
            (child) => child.taskId === overlord.taskId
          );
          if (index !== -1) {
            updatedChildren[index] = overlord;
            this.setTaskNavigationView(
              currentView.taskOverlord,
              updatedChildren
            );
          }
        }
      }
    }
  }

  private async handleTasksCreated(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.handleTaskCreated(task);
    }
  }

  private async handleTasksUpdated(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.handleTaskUpdated(task);
    }
  }

  async previous(task: Task): Promise<void> {
    if (!task.overlord) {
      console.error('No overlord found for the task.');
      return;
    }

    console.log('get boss of: ' + task.name);
    const superOverlord = await this.taskService.getSuperOverlord(
      task.overlord
    );
    if (superOverlord) {
      const tasks = await this.taskService.getOverlordChildren(
        superOverlord.taskId
      );
      if (tasks) this.setTaskNavigationView(superOverlord, tasks);
    } else {
      console.error('No super overlord found for the task.');
    }
  }

  async back(task: Task): Promise<void> {
    if (!task.overlord) {
      console.error('No overlord found for the task.');
      return;
    }

    // console.log('get boss of: ' + task.name);
    const superOverlord = await this.taskService.getSuperOverlord(task.taskId);
    if (superOverlord) {
      const tasks = await this.taskService.getOverlordChildren(task.overlord);
      if (tasks) this.setTaskNavigationView(superOverlord, tasks);
    } else {
      console.error('No super overlord found for the task.');
    }
  }

  async next(task: Task): Promise<void> {
    const tasks = await this.taskService.getOverlordChildren(task.taskId);
    if (tasks) this.setTaskNavigationView(task, tasks);
    if (!tasks) this.setTaskNavigationView(task, []);
  }

  setTaskNavigationView(taskOverlord: Task, taskChildren: Task[]): void {
    console.log('Setting new view: ');
    console.log(taskOverlord);
    console.log(taskChildren);
    const view: TaskNavigationView = {
      taskOverlord,
      taskChildren,
    };
    this.taskNavigationViewSubject.next(view);
  }

  getTaskNavigationView(): Observable<TaskNavigationView | null> {
    return this.taskNavigationViewSubject.asObservable();
  }
}
