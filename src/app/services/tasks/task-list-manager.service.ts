import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TaskListRules,
  ListRules,
  defaultTaskLists,
} from '../../models/task-list-model';
import { ExtendedTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskListManagerService {
  // private lists = new Map<string, TaskList>();
  // private listsSubject = new BehaviorSubject<TaskList[]>([]);
  // lists$ = this.listsSubject.asObservable();
  // constructor() {
  //   this.initializeDefaultLists();
  // }
  // private initializeDefaultLists(): void {
  //   defaultTaskLists.forEach((list) => this.lists.set(list.id, { ...list }));
  //   this.updateListsSubject();
  // }
  // getList(id: string): TaskList | undefined {
  //   return this.lists.get(id);
  // }
  // updateTasksForList(id: string, tasks: string[]): void {
  //   const list = this.lists.get(id);
  //   if (list) {
  //     list.tasks = tasks;
  //     this.updateListsSubject();
  //   }
  // }
  // applyRulesToList(key: TaskListKey, tasks: ExtendedTask[]): ExtendedTask[] {
  //   const list = this.lists.get(id);
  //   if (!list || !list.rules) return tasks;
  //   const { filter, sorter } = list.rules;
  //   let filteredTasks = filter ? tasks.filter(filter) : tasks;
  //   if (sorter) {
  //     filteredTasks = filteredTasks.sort(sorter);
  //   }
  //   return filteredTasks;
  // }
  // private updateListsSubject(): void {
  //   this.listsSubject.next(Array.from(this.lists.values()));
  // }
}
