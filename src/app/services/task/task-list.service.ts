import { Injectable } from '@angular/core';
import { TaskService } from './task.service';

/**
 * TaskListService provides an abstracted interface to manage different types of task lists,
 *
 * Usage:
 * This service is designed to be used as a central access point for all task list manipulations
 */
@Injectable({
  providedIn: 'root',
})
export class TaskListService {
  constructor(private taskService: TaskService) {}
  test() {
    // get certain tasks... i.e. all recent tasks...
    // focus tasks...
    // root tasks
    // settings root tasks...
    //
    this.taskService.getTasks();
  }
}
