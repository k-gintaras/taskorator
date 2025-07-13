// Fix for TaskPathService - it needs proper push/pop/clear methods

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PathItem {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskPathService {
  private currentPathSubject = new BehaviorSubject<PathItem[]>([]);

  currentPath$ = this.currentPathSubject.asObservable();

  push(item: PathItem) {
    const currentPath = this.currentPathSubject.value;
    // Don't add if it's already the last item
    if (
      currentPath.length > 0 &&
      currentPath[currentPath.length - 1].id === item.id
    ) {
      return;
    }
    this.currentPathSubject.next([...currentPath, item]);
  }

  pop(): PathItem | null {
    const currentPath = this.currentPathSubject.value;
    if (currentPath.length === 0) return null;

    const popped = currentPath[currentPath.length - 1];
    this.currentPathSubject.next(currentPath.slice(0, -1));
    return popped;
  }

  // Remove everything after and including the specified id
  removePath(id: string) {
    const currentPath = this.currentPathSubject.value;
    const index = currentPath.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.currentPathSubject.next(currentPath.slice(0, index));
    }
  }

  // Set path to a single item (for when navigating to a root or specific task)
  setToSingle(item: PathItem) {
    this.currentPathSubject.next([item]);
  }

  // Clear all path
  clear() {
    this.currentPathSubject.next([]);
  }

  getCurrentPath(): PathItem[] {
    return this.currentPathSubject.value;
  }

  getTreeDepth(): number {
    return this.currentPathSubject.value.length;
  }
}
