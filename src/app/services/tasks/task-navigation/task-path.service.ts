import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_TASK_ID } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskPathService {
  private path$ = new BehaviorSubject<{ id: string; name: string }[]>([]);
  currentPath$ = this.path$.asObservable();

  getCurrentPath() {
    return this.path$.value;
  }

  setPath(p: { id: string; name: string }[]) {
    this.path$.next(p);
  }

  push(task: { id: string; name: string }) {
    const current = this.getCurrentPath();
    if (current.length === 0 || current[current.length - 1].id !== task.id) {
      this.setPath([...current, task]);
    }
    // else ignore duplicate push of same last task
  }

  pop() {
    let p = this.getCurrentPath();
    if (p.length === 0) return;

    // Remove last
    p = p.slice(0, -1);

    // If after popping the last is ROOT_TASK_ID, remove it too (clean root)
    if (p.length > 0 && p[p.length - 1].id === ROOT_TASK_ID) {
      p = p.slice(0, -1);
    }

    this.setPath(p);
  }

  clear() {
    this.setPath([]);
  }

  removePath(id: string) {
    const current = this.getCurrentPath();
    const idx = current.findIndex((task) => task.id === id);
    if (idx !== -1) {
      this.setPath(current.slice(0, idx + 1));
    }
  }
}
