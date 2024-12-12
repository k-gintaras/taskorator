import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskList, ListRules } from '../../models/task-list';
import { ExtendedTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskListManagerService {
  constructor() {}
  private lists: Map<string, TaskList> = new Map();
  private listsSubject = new BehaviorSubject<TaskList[]>([]);

  lists$ = this.listsSubject.asObservable();

  createList(
    id: string,
    title: string,
    tasks: string[],
    rules?: ListRules,
    type?: string,
    parent?: string,
    description?: string
  ): void {
    const newList: TaskList = {
      id,
      title,
      tasks,
      rules,
      type,
      parent,
      description,
    };
    this.lists.set(id, newList);
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
