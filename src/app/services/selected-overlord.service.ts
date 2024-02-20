import { Injectable, Input } from '@angular/core';
import { Task } from '../models/taskModelManager';
import { ExtendedTask } from '../models/massTaskEditModel';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedOverlordService {
  private selectedOverlord = new BehaviorSubject<Task | null>(null);

  getSelectedOverlord() {
    return this.selectedOverlord.asObservable();
  }

  setSelectedOverlord(task: Task) {
    this.selectedOverlord.next(task);
  }

  filterOverlordTasks(event: any, tasks: ExtendedTask[] | Task[]) {
    const searchTerm = event.term;
    if (searchTerm) {
      return tasks.filter((task) =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return tasks;
    }
  }
}
