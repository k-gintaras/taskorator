import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExtendedTask } from '../../models/massTaskEditModel';
import { Task } from '../../models/taskModelManager';
import { UrlHelperService } from './url-helper.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedOverlordService {
  private selectedOverlord = new BehaviorSubject<Task | null>(null);

  getSelectedOverlordObservable(): Observable<Task | null> {
    return this.selectedOverlord.asObservable();
  }

  getSelectedOverlord(): Task | null {
    return this.selectedOverlord.value;
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
