import { Injectable } from '@angular/core';
import { Observable, tap, of, BehaviorSubject } from 'rxjs';
import { Task } from '../task-model/taskModelManager';
import { TaskTree } from 'src/task-tree';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  private tasks: Task[] = [];
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>(
    []
  );

  private taskTree: TaskTree = new TaskTree();
  defaultTaskId = 128;

  constructor() {}

  getAllTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTaskTree(): TaskTree {
    return this.taskTree;
  }

  updateTasks(tasks: Task[]): Observable<void> {
    // Update the local tasks array with the server tasks
    this.tasks = tasks;
    this.tasksSubject.next(this.tasks); // Notify components about the updated tasks

    // TODO: fix all tasks and prefix them here too i guess for now...
    const tidyTasks = this.prepareTaskArray(tasks);
    console.log(tidyTasks.length);
    this.taskTree.buildTree(tidyTasks);

    return of(undefined); // Return an observable of void since there is no asynchronous operation here
  }

  // tree helper... i dont want to create more services... makes me sick a bit
  prepareTaskArray(tasks: Task[]): Task[] {
    // Step 1: Identify existing task IDs
    const taskIds = new Set(tasks.map((task) => task.taskId));
    const rootId = 129;
    let counter = 0;

    // Step 2: Prepare tasks
    return tasks.map((task) => {
      // Clone task to avoid modifying the original object
      const preparedTask = { ...task };

      // Exclude the root task from these adjustments
      if (preparedTask.taskId !== rootId) {
        // Check and correct null overlord
        if (preparedTask.overlord === null) {
          preparedTask.overlord = rootId;
          counter++;
        }

        // Check and correct self as overlord
        if (preparedTask.overlord === preparedTask.taskId) {
          preparedTask.overlord = rootId; // Resetting to root
          counter++;
        }

        // Check and correct if overlord does not exist in the list
        if (
          preparedTask.overlord !== rootId &&
          !taskIds.has(preparedTask.overlord)
        ) {
          preparedTask.overlord = rootId; // Resetting to root
          counter++;
        }
      }

      console.log('bad task parents: ' + counter);
      return preparedTask;
    });
  }

  deleteTask(taskId: number): Observable<any> {
    console.log('Deleted' + taskId);
    const index = this.tasks.findIndex((t) => t.taskId === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.tasksSubject.next(this.tasks); // Notify components about the updated tasks
    }
    return of(null);
  }

  createTask(task: Task): Observable<Task> {
    this.tasks.push(task);
    this.tasksSubject.next(this.tasks);
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    const existingTask = this.tasks.find((t) => t.taskId === task.taskId);
    if (existingTask) {
      Object.assign(existingTask, task);
      this.tasksSubject.next(this.tasks);
    }
    return of(task);
  }
}
