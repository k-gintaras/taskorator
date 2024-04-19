import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtendedTask } from 'src/app/models/massTaskEditModel';
import { Task } from 'src/app/models/taskModelManager';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
