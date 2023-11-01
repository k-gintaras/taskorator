import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FilterBaseService {
  private filteredTasks = new BehaviorSubject<Task[]>([]);

  constructor() {}

  setTasks(t: Task[]) {
    this.filteredTasks.next([...t]);
  }

  getTasks() {
    return this.filteredTasks.asObservable();
  }
}
