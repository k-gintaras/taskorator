import { Injectable } from '@angular/core';
import { Task, maxPriority } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FilterHelperService {
  constructor() {}

  getHigherPriorityFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.priority > maxPriority / 2);
  }

  getOverlordTasks(tasks: Task[] | undefined) {
    const overlords = new Set(tasks?.map((task) => task.overlord));
    return tasks?.filter((task) => overlords.has(task.taskId));
  }

  getNonOverlordTasks(tasks: Task[] | undefined) {
    const overlords = new Set(tasks?.map((task) => task.overlord));
    return tasks?.filter((task) => !overlords.has(task.taskId));
  }

  getActiveFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.status === 'active');
  }

  getStatusFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.status === 'inactive');
  }

  getTasksCreatedToday(tasks: Task[] | undefined): Task[] | undefined {
    return tasks?.filter((task) => this.isToday(new Date(task.timeCreated)));
  }

  getTasksCreatedThisWeek(tasks: Task[] | undefined): Task[] | undefined {
    const tasksThisWeek = tasks?.filter((task) =>
      this.isThisWeek(new Date(task.timeCreated))
    );

    return tasksThisWeek?.sort(
      (a, b) =>
        new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
    );
  }

  getTasksCreatedThisMonth(tasks: Task[] | undefined): Task[] | undefined {
    return tasks?.filter((task) =>
      this.isThisMonth(new Date(task.timeCreated))
    );
  }

  // your helper functions (isToday, isThisWeek, isThisMonth) will go here.

  isToday(date: Date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isThisWeek(date: Date) {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    const lastDayOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 6
    );
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  }

  isThisMonth(date: Date) {
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
