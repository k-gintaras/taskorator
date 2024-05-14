import { Injectable } from '@angular/core';
import {
  TaskNavigationView,
  TaskNavigatorService,
} from './task-navigator.service';
import { ConfigService } from '../../../services/core/config.service';
import { EventBusService } from '../../../services/core/event-bus.service';
import { PreviousService } from '../../../services/task/previous.service';
import { TaskService } from '../../../services/task/task.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { getBaseTask, Task } from '../../../models/taskModelManager';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorUltraService extends TaskNavigatorService {
  // private initialTasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<
  //   Task[]
  // >([]);

  protected initialTasksSubject: BehaviorSubject<TaskNavigationView | null> =
    new BehaviorSubject<TaskNavigationView | null>(null);

  constructor(
    taskService: TaskService,
    eventBusService: EventBusService,
    previousService: PreviousService,
    configService: ConfigService
  ) {
    super(taskService, eventBusService, previousService, configService);
  }

  setInitialTasks(overlord: Task, tasks: Task[]): void {
    this.initialTasksSubject.next({
      taskOverlord: overlord,
      taskChildren: tasks,
    });
  }

  override async previous(task: Task): Promise<void> {
    if (!task.overlord) {
      const initialTasks = this.initialTasksSubject.value;
      if (initialTasks && initialTasks.taskChildren.length > 0) {
        this.setTaskNavigationView(
          initialTasks.taskOverlord,
          initialTasks.taskChildren
        );
      } else {
        this.error('No overlord found for the task and no initial tasks set.');
      }
      return;
    }

    const superOverlord = await this.taskService.getSuperOverlord(
      task.overlord
    );
    if (superOverlord) {
      const tasks = await this.taskService.getOverlordChildren(
        superOverlord.taskId
      );
      if (tasks) {
        this.setTaskNavigationView(superOverlord, tasks);
      }
    } else {
      const initialTasks = this.initialTasksSubject.value;
      if (initialTasks && initialTasks.taskChildren.length > 0) {
        this.setTaskNavigationView(
          initialTasks.taskOverlord,
          initialTasks.taskChildren
        );
      } else {
        this.error(
          'No super overlord found for the task and no initial tasks set.'
        );
      }
    }
  }

  override setTaskNavigationView(
    taskOverlord: Task | null,
    taskChildren: Task[]
  ): void {
    this.log('Setting new view in ultra:');
    this.log(taskOverlord);
    this.log(taskChildren);
    if (!taskOverlord) {
      taskOverlord = getBaseTask(); // just let it be base task, which is root task
    }
    const view: TaskNavigationView = {
      taskOverlord,
      taskChildren,
    };
    this.taskNavigationViewSubject.next(view);
  }

  getInitialTasks(): Observable<TaskNavigationView | null> {
    return this.initialTasksSubject.asObservable();
  }
}
