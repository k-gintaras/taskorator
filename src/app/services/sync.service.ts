import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ApiService, TaskResponse } from './api.service';
import { LocalService } from './local.service';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private apiService: ApiService,
    private localService: LocalService
  ) {}

  // createTask(task: Task): Observable<TaskResponse> {
  //   // Update the task in the local array immediately
  //   this.localService.createTask(task).subscribe();
  //   console.log('saving:   ' + task.overlord);

  //   // Now initiate the API call to update the task on the server (without waiting for the response)
  //   return this.apiService.createTaskWithId(task).pipe(
  //     tap((taskResponse: TaskResponse) =>
  //       console.log(
  //         `Task ${task.name} with ID ${taskResponse.taskId} successfully updated on the server`
  //       )
  //     ),
  //     catchError((apiError) => {
  //       console.error(
  //         `API updateTask failed for task with ID ${task.taskId}:`,
  //         apiError
  //       );
  //       // Re-throw the error as a new error using a factory function
  //       return throwError(
  //         () => new Error('Failed to update task on the server')
  //       );
  //     })
  //   );
  // }
  createTask(task: Task): Observable<TaskResponse | null> {
    // creating here allows task to exist without existing on server and without an existing ID (which is not allowed)
    // const localTask = { ...task };
    // this.localService.createTask(localTask).subscribe();

    return this.apiService.createTaskWithId(task).pipe(
      tap((taskResponse: TaskResponse) => {
        // create task with real server database id
        // can later update it
        const localTask = { ...task };
        localTask.taskId = taskResponse.taskId;
        this.localService.createTask(localTask).subscribe();

        console.log(`Task ${localTask.name} now has ID ${taskResponse.taskId}`);
      }),
      catchError((apiError) => {
        console.log(`API createTask failed:`, apiError);
        return of(null);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    // Update the task in the local array immediately
    this.localService.updateTask(task).subscribe();

    // Now initiate the API call to update the task on the server (without waiting for the response)
    return this.apiService.updateTask(task).pipe(
      tap(() =>
        console.log(
          `Task with ID ${task.taskId} successfully updated on the server`
        )
      ),
      catchError((apiError) => {
        console.error(
          `API updateTask failed for task with ID ${task.taskId}:`,
          apiError
        );
        // Re-throw the error as a new error using a factory function
        return throwError(
          () => new Error('Failed to update task on the server')
        );
      })
    );
  }

  updateTasks(tasks: Task[]): Observable<Task[]> {
    // Update tasks locally
    tasks.forEach((task) => this.localService.updateTask(task).subscribe());

    // Batch update on the server
    return this.apiService.updateTasks(tasks).pipe(
      tap(() => console.log(`Tasks successfully updated on the server`)),
      catchError((apiError) => {
        console.error(`API updateTasks failed:`, apiError);
        return throwError(
          () => new Error('Failed to update tasks on the server')
        );
      })
    );
  }

  deleteTask(taskId: string): Observable<any> {
    // Delete the task from the local array immediately
    this.localService.deleteTask(taskId).subscribe();

    // Now initiate the API call to delete the task from the server (without waiting for the response)
    return this.apiService.deleteTask(taskId).pipe(
      tap(() =>
        console.log(
          `Task with ID ${taskId} successfully deleted from the server`
        )
      ),
      catchError((apiError) => {
        console.error(
          `API deleteTask failed for task with ID ${taskId}:`,
          apiError
        );
        // Re-throw the error as a new error using a factory function
        return throwError(
          () => new Error('Failed to delete task from the server')
        );
      })
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.apiService.fetchTasks().pipe(
      catchError((apiError) => {
        console.error('API fetchTasks failed:', apiError);
        // If the API request fails, use the local service to get tasks locally
        return this.localService.getAllTasks().pipe(
          catchError((localError) => {
            console.error('Local getAllTasks failed:', localError);
            // Re-throw the error as a new error using a factory function
            return throwError(() => new Error('Failed to fetch tasks'));
          })
        );
      })
    );
  }

  checkApiHealth(): Observable<any> {
    // Check the API health using the API service
    return this.apiService.checkApiHealth().pipe(
      catchError((localError) => {
        console.error('Local getAllTasks failed:', localError);
        // Re-throw the error as a new error using a factory function
        return throwError(() => new Error('Failed to check api health'));
      })
    );
  }
}
