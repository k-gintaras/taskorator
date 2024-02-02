import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Task } from '../task-model/taskModelManager';

export interface TaskResponse {
  message: string;
  taskId: string;
}
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiHealthUrl = 'http://localhost:3000/health'; // Replace with your server URL
  private apiUrl = 'http://localhost:3000/tasks'; // Replace with your server URL

  constructor(private http: HttpClient) {}

  checkApiHealth(): Observable<any> {
    return this.http.get<any>(this.apiHealthUrl);
  }

  fetchTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map((tasks: any[]) => tasks.map((task) => this.parseTaskDates(task))),
      map((tasks) => tasks.filter((task) => task.stage !== 'deleted')),
      catchError((error) => {
        // Handle or log the error
        console.error('Error fetching tasks:', error);
        return of([]); // Return an empty array or some default value
      })
    );
  }

  private parseTaskDates(task: any): Task {
    ['timeCreated', 'lastUpdated', 'timeEnd'].forEach((dateField) => {
      if (task[dateField]) {
        let parsedDate = new Date(task[dateField]);
        task[dateField] = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      }
    });
    // Additional processing if needed

    return task as Task;
  }

  // fetchTasks(): Observable<Task[]> {
  //   return this.http.get<Task[]>(this.apiUrl).pipe(
  //     map((tasks: any[]) =>
  //       tasks.map((task) => {
  //         task.timeCreated = new Date(task.timeCreated);
  //         if (isNaN(task.timeCreated.getTime())) {
  //           task.timeCreated = new Date();
  //         }

  //         if (task.lastUpdated) {
  //           task.lastUpdated = new Date(task.lastUpdated);
  //           if (isNaN(task.lastUpdated.getTime())) {
  //             task.lastUpdated = new Date();
  //           }
  //         }

  //         if (task.timeEnd) {
  //           task.timeEnd = new Date(task.timeEnd);
  //           if (isNaN(task.timeEnd.getTime())) {
  //             task.timeEnd = new Date();
  //           }
  //         }

  //         // TODO: maybe set SEEN to false if longer than day ?

  //         return task as Task;
  //       })
  //     ),
  //     // Use filter to remove tasks with stage === 'deleted'
  //     map((tasks) => tasks.filter((task) => task.stage !== 'deleted'))
  //   );
  // }

  updateTask(task: Task): Observable<Task> {
    const updateUrl = `${this.apiUrl}/${task.taskId}`;
    return this.http.put<Task>(updateUrl, task);
  }

  updateTasks(tasks: Task[]): Observable<Task[]> {
    const updateUrl = `${this.apiUrl}/batch-update`;
    return this.http.put<Task[]>(updateUrl, tasks);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  createTaskWithId(task: Task): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  deleteTask(taskId: string): Observable<any> {
    const deleteUrl = `${this.apiUrl}/${taskId}`;
    return this.http.delete<any>(deleteUrl);
  }
}
