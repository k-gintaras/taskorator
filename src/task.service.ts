import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './app/task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks'; // Replace with your server URL

  constructor(private http: HttpClient) {}

  // Function to get all tasks from the server
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Function to create a new task on the server
  createTask(task: Task): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  // Add other functions for updating and deleting tasks as needed
}
