import { Injectable } from '@angular/core';
import { Task } from 'src/app/models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class SortService {
  sortByPriority(tasks: Task[]): Task[] {
    if (!tasks) return [];
    return tasks.sort((a, b) => {
      if (b.priority === a.priority) {
        // Ensure lastUpdated is handled correctly
        const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        return timeB - timeA;
      }
      return b.priority - a.priority;
    });
  }
}
