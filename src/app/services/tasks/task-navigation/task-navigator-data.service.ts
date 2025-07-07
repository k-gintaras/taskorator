import { Injectable } from '@angular/core';
import { TaskListKey } from '../../../models/task-list-model';
import { BehaviorSubject } from 'rxjs';
import { ExtendedTask } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskNavigatorDataService {
  private currentTasksSubject = new BehaviorSubject<ExtendedTask[]>([]);
  private currentListKeySubject = new BehaviorSubject<TaskListKey | null>(null);
  private currentPathSubject = new BehaviorSubject<string[]>([]); // ✨ Track path

  currentTasks$ = this.currentTasksSubject.asObservable();
  currentListKey$ = this.currentListKeySubject.asObservable();
  currentPath$ = this.currentPathSubject.asObservable(); // ✨ Expose path

  setTasks(tasks: ExtendedTask[], listKey: TaskListKey) {
    this.currentTasksSubject.next(tasks);
    this.currentListKeySubject.next(listKey);
  }

  getCurrentTasks(): ExtendedTask[] {
    return this.currentTasksSubject.value;
  }

  getCurrentListKey(): TaskListKey | null {
    return this.currentListKeySubject.value;
  }

  getCurrentPath(): string[] {
    return this.currentPathSubject.value;
  }

  getTreeDepth(): number {
    return this.currentPathSubject.value.length;
  }
}
