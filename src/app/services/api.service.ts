import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Task } from '../task-model/taskModelManager';

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

  // fetchTasks(): Observable<Task[]> {
  //   return this.http.get<Task[]>(this.apiUrl);
  // }

  fetchTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map((tasks: any[]) =>
        tasks.map((task) => {
          task.timeCreated = new Date(task.timeCreated);
          if (isNaN(task.timeCreated.getTime())) {
            task.timeCreated = new Date();
          }

          if (task.lastUpdated) {
            task.lastUpdated = new Date(task.lastUpdated);
            if (isNaN(task.lastUpdated.getTime())) {
              task.lastUpdated = new Date();
            }
          }

          if (task.timeEnd) {
            task.timeEnd = new Date(task.timeEnd);
            if (isNaN(task.timeEnd.getTime())) {
              task.timeEnd = new Date();
            }
          }

          return task as Task;
        })
      ),
      // Use filter to remove tasks with stage === 'deleted'
      map((tasks) => tasks.filter((task) => task.stage !== 'deleted'))
    );
  }

  fetchAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map((tasks: any[]) =>
        tasks.map((task) => {
          task.timeCreated = new Date(task.timeCreated);
          if (isNaN(task.timeCreated.getTime())) {
            task.timeCreated = new Date();
          }

          if (task.lastUpdated) {
            task.lastUpdated = new Date(task.lastUpdated);
            if (isNaN(task.lastUpdated.getTime())) {
              task.lastUpdated = new Date();
            }
          }

          if (task.timeEnd) {
            task.timeEnd = new Date(task.timeEnd);
            if (isNaN(task.timeEnd.getTime())) {
              task.timeEnd = new Date();
            }
          }

          return task as Task;
        })
      )
    );
  }

  // getAllTasks(): Observable<Task[]> {
  //   return this.http.get<Task[]>(this.apiUrl);
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

  deleteTask(taskId: number): Observable<any> {
    console.log('trying to delete: ' + taskId);
    const deleteUrl = `${this.apiUrl}/${taskId}`;
    console.log(deleteUrl);
    return this.http.delete<any>(deleteUrl);
  }
}
