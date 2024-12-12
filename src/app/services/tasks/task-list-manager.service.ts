import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskList, ListRules, defaultTaskLists } from '../../models/task-list';
import { ExtendedTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskListManagerService {
  private lists: Map<string, TaskList> = new Map();
  private listsSubject = new BehaviorSubject<TaskList[]>([]);

  lists$ = this.listsSubject.asObservable();

  constructor() {
    this.initializeDefaultLists();
  }

  private initializeDefaultLists(): void {
    defaultTaskLists.forEach((list) => this.lists.set(list.id, { ...list }));
    this.updateListsSubject();
  }

  getList(id: string): TaskList | undefined {
    return this.lists.get(id);
  }

  updateTasksForList(id: string, tasks: string[]): void {
    const list = this.lists.get(id);
    if (list) {
      list.tasks = tasks;
      this.updateListsSubject();
    }
  }

  applyRulesToList(id: string, tasks: ExtendedTask[]): ExtendedTask[] {
    const list = this.lists.get(id);
    if (!list || !list.rules) return tasks;

    const { filter, sorter } = list.rules;
    let filteredTasks = filter ? tasks.filter(filter) : tasks;
    if (sorter) {
      filteredTasks = filteredTasks.sort(sorter);
    }
    return filteredTasks;
  }

  private updateListsSubject(): void {
    this.listsSubject.next(Array.from(this.lists.values()));
  }
}
