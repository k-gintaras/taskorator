import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtendedTask, Task } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class StagedTasksService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  addTask(task: Task): void {
    const currentTasks = this.tasksSubject.getValue();
    this.tasksSubject.next([...currentTasks, task]);
  }

  deleteTask(taskId: string): void {
    const currentTasks = this.tasksSubject.getValue();
    this.tasksSubject.next(
      currentTasks.filter((task) => task.taskId !== taskId)
    );
  }

  clearTasks(): void {
    this.tasksSubject.next([]);
  }
}
