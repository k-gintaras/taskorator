import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskSyncService {
  // private apiUrl = 'http://localhost:3000/tasks'; // Replace with your server URL
  // private tasks: Task[] = [];
  // private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>(
  //   []
  // );
  // private testing = true; // Set this to false when deploying to the actual server
  // constructor(private http: HttpClient, private taskService: TaskService) {
  //   this.fetchTasks();
  // }
  // // Function to fetch tasks from the server
  // private fetchTasks() {
  //   this.http.get<Task[]>(this.apiUrl).subscribe((tasks) => {
  //     this.tasks = tasks;
  //     this.tasksSubject.next(this.tasks);
  //   });
  // }
  // // Function to get all tasks as an Observable
  // getAllTasks(): Observable<Task[]> {
  //   return this.tasksSubject.asObservable();
  // }
  // // Function to update a task on the server and locally
  // updateTask(task: Task): Observable<Task> {
  //   const updateUrl = `${this.apiUrl}/${task.taskId}`;
  //   return this.http.put<Task>(updateUrl, task).pipe(
  //     tap((updatedTask) => {
  //       this.taskService.updateLocalTask(updatedTask);
  //     })
  //   );
  // }
  // createTask(task: Task): Observable<Task> {
  //   if (this.testing) {
  //     // Simulate server submission by just returning the task without submitting to the server
  //     return of(task).pipe(
  //       tap((createdTask) => {
  //         this.taskService.createLocalTask(createdTask);
  //       })
  //     );
  //   } else {
  //     // Perform actual server submission
  //     return this.http.post<Task>(this.apiUrl, task).pipe(
  //       tap((createdTask) => {
  //         this.taskService.createLocalTask(createdTask);
  //       })
  //     );
  //   }
  // }
  // // Function to delete a task on the server and locally
  // deleteTask(taskId: number): Observable<any> {
  //   const deleteUrl = `${this.apiUrl}/${taskId}`;
  //   return this.http.delete<any>(deleteUrl).pipe(
  //     tap(() => {
  //       this.taskService.deleteLocalTask(taskId);
  //     })
  //   );
  // }
}
