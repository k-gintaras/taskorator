import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskPathService {
  private currentPathSubject = new BehaviorSubject<string[]>([]); // ✨ Track path

  currentPath$ = this.currentPathSubject.asObservable(); // ✨ Expose path

  setPath(path?: string[]) {
    this.currentPathSubject.next(path || []); // ✨ Set path
  }

  getCurrentPath(): string[] {
    return this.currentPathSubject.value;
  }

  getTreeDepth(): number {
    return this.currentPathSubject.value.length;
  }
}
