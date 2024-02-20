import { Injectable } from '@angular/core';
import { Task } from '../models/taskModelManager';
import { ApiService } from './api.service';
import { LocalService } from './local.service';
import { Observable, catchError, mergeMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskLoaderService {
  constructor(
    private apiService: ApiService,
    private localService: LocalService
  ) {}

  loadTasks(): void {
    this.apiService
      .fetchTasks()
      .pipe(
        mergeMap((serverTasks: Task[]) => {
          return this.localService.updateTasks(serverTasks).pipe(
            catchError((localError) => {
              console.error('Local updateTasks failed:', localError);
              // Re-throw the error as a new error using a factory function
              throw new Error('Failed to update local tasks');
            })
          );
        })
      )
      .subscribe({
        next: () => {
          console.log('Tasks loaded and updated in local storage');
        },
        error: (apiError) => {
          console.error('API fetchTasks failed:', apiError);
        },
      });
  }

  loadTasksSlow(): Observable<void> {
    return this.apiService.fetchTasks().pipe(
      mergeMap((serverTasks: Task[]) => {
        return this.localService.updateTasks(serverTasks).pipe(
          catchError((localError) => {
            console.error('Local updateTasks failed:', localError);
            // Re-throw the error as a new error using a factory function
            return throwError(() => new Error('Failed to update local tasks'));
          })
        );
      })
    );
  }
}
