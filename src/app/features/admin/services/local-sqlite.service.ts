import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Task } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class LocalSqliteService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Example method to fetch data from the database

  getTaskData(): Observable<Task[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks`).pipe(
      map((tasks) => {
        // Ensure taskId and overlord are consistently returned as strings
        tasks.forEach((task) => {
          task.taskId = String(task.taskId); // Convert taskId to string
          task.overlord = String(task.overlord); // Convert overlord to string
        });
        return tasks;
      })
    );
  }

  // Example method to post data to the database
  postData(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, data);
  }
}
