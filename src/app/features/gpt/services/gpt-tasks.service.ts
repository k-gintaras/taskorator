import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class GptTasksService {
  private tasks: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);

  constructor() {}

  getTasks() {
    return this.tasks.asObservable();
  }

  addTask(task: Task) {
    const currentTasks = this.tasks.getValue();
    if (task.taskId === '0') {
      task.taskId = this.generateUniqueId(); // Ensure each task has a unique ID
    }
    this.tasks.next([...currentTasks, task]);
  }

  private generateUniqueId(): string {
    // Simple unique ID generation: This is for demonstration; use a more robust method in production!
    return Math.random().toString(36).substring(2, 9);
  }

  removeTask(taskId: string) {
    console.log('Attempting to remove task with ID:', taskId);
    const currentTasks = this.tasks.getValue();
    console.log('Current tasks before removal:', currentTasks);

    const updatedTasks = currentTasks.filter((task) => task.taskId !== taskId);
    console.log('Tasks after attempted removal:', updatedTasks);

    this.tasks.next(updatedTasks);
  }
}
