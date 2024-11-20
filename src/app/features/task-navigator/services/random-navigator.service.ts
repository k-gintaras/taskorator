import { Injectable } from '@angular/core';
import { ConfigService } from '../../../services/core/config.service';
import { EventBusService } from '../../../services/core/event-bus.service';
import { PreviousService } from '../../../services/task/previous.service';
import { SelectedOverlordService } from '../../../services/task/selected-overlord.service';
import { TaskService } from '../../../services/task/task.service';
import {
  TaskNavigationView,
  TaskNavigatorService,
} from './task-navigator.service';
import { getBaseTask, Task } from '../../../models/taskModelManager';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RandomNavigatorService extends TaskNavigatorService {
  protected initialTasksSubject: BehaviorSubject<TaskNavigationView | null> =
    new BehaviorSubject<TaskNavigationView | null>(null);
  constructor(
    private selectedOverlordService: SelectedOverlordService,
    taskService: TaskService,
    eventBusService: EventBusService,
    previousService: PreviousService,
    configService: ConfigService
  ) {
    super(taskService, eventBusService, previousService, configService);
  }

  override async handleTaskUpdated(task: Task): Promise<void> {
    const currentView = this.taskNavigationViewSubject.value;

    if (currentView) {
      const updatedTasks = currentView.taskChildren.map((child) =>
        child.taskId === task.taskId ? { ...child, ...task } : child
      );

      // If the task being updated is not already in the list, add it.
      const taskExists = updatedTasks.some((t) => t.taskId === task.taskId);

      if (!taskExists) {
        updatedTasks.push(task);
      }

      // Update the navigation view without considering overlord hierarchy
      this.setTaskNavigationView(currentView.taskOverlord, updatedTasks);
    }
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
    if (!taskOverlord) {
      taskOverlord = getBaseTask(); // just let it be base task, which is root task
    }
    const view: TaskNavigationView = {
      taskOverlord,
      taskChildren,
    };
    this.taskNavigationViewSubject.next(view);
    this.selectedOverlordService.setSelectedOverlord(taskOverlord);
  }

  getInitialTasks(): Observable<TaskNavigationView | null> {
    return this.initialTasksSubject.asObservable();
  }
}
