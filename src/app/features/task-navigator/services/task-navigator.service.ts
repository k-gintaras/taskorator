import { Injectable } from '@angular/core';
import { TaskService } from '../../../services/task/task.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBusService } from '../../../services/core/event-bus.service';
import { CoreService } from '../../../services/core/core.service';
import { ConfigService } from '../../../services/core/config.service';
import { PreviousService } from '../../../services/task/previous.service';
import { ActivatedRoute } from '@angular/router';
import { Task, ROOT_TASK_ID } from '../../../models/taskModelManager';
import { TaskSettings } from '../../../models/settings';
import { TaskListService } from '../../../services/task/task-list/task-list.service';

export interface TaskNavigationView {
  taskOverlord: Task;
  taskChildren: Task[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorService extends CoreService {
  protected taskNavigationViewSubject: BehaviorSubject<TaskNavigationView | null> =
    new BehaviorSubject<TaskNavigationView | null>(null);

  constructor(
    protected taskService: TaskService,
    protected eventBusService: EventBusService,
    protected previousService: PreviousService,
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

  async getPreviousTaskId(
    settings: TaskSettings,
    route: ActivatedRoute
  ): Promise<string> {
    if (!settings) {
      this.error('Settings are required to initialize tasks.');
      return ROOT_TASK_ID;
    }
    const overlordId = await this.previousService.getPreviousOverlordId(
      route,
      settings
    );
    if (!overlordId) {
      return ROOT_TASK_ID;
    }
    return overlordId;
  }

  async setTaskNavigationViewFromId(overlordId: string): Promise<void> {
    const overlord: Task | undefined = await this.taskService.getTaskById(
      overlordId
    );
    if (overlord) {
      const children: Task[] | undefined =
        await this.taskService.getOverlordChildren(overlordId);
      this.setTaskNavigationView(overlord, children || []);
    } else {
      this.error('No overlord found.');
    }
  }

  private async handleTaskCreated(task: Task): Promise<void> {
    const currentView = this.taskNavigationViewSubject.value;
    if (currentView && currentView.taskOverlord) {
      if (task.overlord === currentView.taskOverlord.taskId) {
        const updatedChildren = [...currentView.taskChildren, task];
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
      } else {
        if (!task.overlord)
          throw new Error("Can't check overlord null @handleTaskCreated");
        const overlord = await this.taskService.getTaskById(task.overlord);
        if (overlord && overlord.overlord === currentView.taskOverlord.taskId) {
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
    if (currentView && currentView.taskOverlord) {
      if (task.overlord === currentView.taskOverlord.taskId) {
        const updatedChildren = currentView.taskChildren.map((child) =>
          child.taskId === task.taskId ? task : child
        );
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
      } else {
        const updatedChildren = currentView.taskChildren.filter(
          (child) => child.taskId !== task.taskId
        );
        this.setTaskNavigationView(currentView.taskOverlord, updatedChildren);
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
      if (task.overlord) await this.handleTaskCreated(task);
    }
  }

  private async handleTasksUpdated(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      if (task.overlord) await this.handleTaskUpdated(task);
    }
  }

  // although we know all the tasks in list have same overlord and we keep it in navigation
  // it is possible to have a list where all tasks have different overlord
  // so it is good that we just get the overlord per each task
  async previous(task: Task): Promise<void> {
    if (!task.overlord) {
      this.error('No overlord found for the task.');
      return;
    }

    const superOverlord = await this.taskService.getSuperOverlord(
      task.overlord
    );
    if (superOverlord) {
      const tasks = await this.taskService.getOverlordChildren(
        superOverlord.taskId
      );
      if (tasks) this.setTaskNavigationView(superOverlord, tasks);
    } else {
      this.error('No super overlord found for the task.');
    }
  }

  // although we know all the tasks in list have same overlord and we keep it in navigation
  // it is possible to have a list where all tasks have different overlord
  // so it is good that we just get the overlord per each task
  async back(task: Task): Promise<void> {
    if (!task.overlord) {
      this.error('No overlord found for the task.');
      return;
    }

    const superOverlord = await this.taskService.getSuperOverlord(task.taskId);
    if (superOverlord) {
      const tasks = await this.taskService.getOverlordChildren(task.overlord);
      if (tasks) this.setTaskNavigationView(superOverlord, tasks);
    } else {
      this.error('No super overlord found for the task.');
    }
  }

  // although we know all the tasks in list have same overlord and we keep it in navigation
  // it is possible to have a list where all tasks have different overlord
  // so it is good that we just get the overlord per each task
  async next(task: Task): Promise<void> {
    const tasks = await this.taskService.getOverlordChildren(task.taskId);
    if (tasks) this.setTaskNavigationView(task, tasks);
    if (!tasks) this.setTaskNavigationView(task, []);
  }

  setTaskNavigationView(taskOverlord: Task, taskChildren: Task[]): void {
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
