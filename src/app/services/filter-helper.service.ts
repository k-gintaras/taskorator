import { Injectable } from '@angular/core';
import {
  RepeatOptions,
  Task,
  maxPriority,
} from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FilterHelperService {
  constructor() {}

  getTasksByOverlordId(overlordId: number, tasks: Task[]): Task[] {
    return tasks?.filter((task) => task.overlord === overlordId);
  }

  getTasksByNoOverlordId(overlordId: number, tasks: Task[]): Task[] {
    return tasks.filter((task) => task.overlord !== overlordId);
  }

  getHigherPriorityFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.priority > maxPriority / 2);
  }

  getOverlords(tasks: Task[] | undefined) {
    const overlords = new Set(tasks?.map((task) => task.overlord));
    return tasks?.filter((task) => overlords.has(task.taskId));
  }

  getSemiOverlords(tasks: Task[] | undefined) {
    const overlords = new Set(tasks?.map((task) => task.overlord));
    return tasks?.filter((task) => !overlords.has(task.taskId));
  }

  getActiveFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.status === 'active');
  }

  getArchived(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.stage === 'archived');
  }

  getDailyRepeat(tasks: Task[] | undefined) {
    return this.getRepeatingTasks(tasks, 'daily');
  }

  getWeeklyRepeat(tasks: Task[] | undefined) {
    return this.getRepeatingTasks(tasks, 'weekly');
  }

  getMonthlyRepeat(tasks: Task[] | undefined) {
    return this.getRepeatingTasks(tasks, 'monthly');
  }

  getStatusFiltered(tasks: Task[] | undefined) {
    return tasks?.filter((task) => task.status === 'inactive');
  }

  getTasksCreatedToday(tasks: Task[] | undefined): Task[] | undefined {
    return tasks?.filter(
      (task) => task.timeCreated && this.isToday(new Date(task.timeCreated))
    );
  }

  getTasksCreatedThisWeek(tasks: Task[] | undefined): Task[] | undefined {
    const tasksThisWeek = tasks?.filter(
      (task) =>
        task.timeCreated &&
        this.isThisWeek(new Date(task.timeCreated)) &&
        task.stage !== 'completed'
    );

    return tasksThisWeek?.sort(
      (a, b) =>
        (b.timeCreated ? new Date(b.timeCreated).getTime() : 0) -
        (a.timeCreated ? new Date(a.timeCreated).getTime() : 0)
    );
  }

  getTasksCreatedThisMonth(tasks: Task[] | undefined): Task[] | undefined {
    return tasks?.filter(
      (task) => task.timeCreated && this.isThisMonth(new Date(task.timeCreated))
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

  getRepeatingTasks(tasks: Task[] | undefined, frequency: RepeatOptions) {
    if (!tasks) return [];

    const currentDate = new Date();

    return tasks.filter((task) => {
      if (task.repeat !== frequency) return false;

      if (!task.lastUpdated) {
        return true; // If lastUpdated is null, we skip this task
      }

      const lastUpdatedDate = new Date(task.lastUpdated);

      // because it does not allow
      // task completed 23:59, task refreshed 06:00 or even 01:00
      // we adjust to "next day"
      // // Check if lastUpdated is more than a day old
      // const isMoreThanADayOld =
      //   currentDate.getTime() - lastUpdatedDate.getTime() > 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      const isNextDay =
        currentDate.getDate() !== lastUpdatedDate.getDate() ||
        currentDate.getMonth() !== lastUpdatedDate.getMonth() ||
        currentDate.getFullYear() !== lastUpdatedDate.getFullYear();

      if (isNextDay) {
        return true; // Show the task if it's more than a day old, regardless of its stage
      } else {
        return task.stage !== 'seen' && task.stage !== 'completed'; // Only show if its stage is not set to seen or completed
      }
    });
  }
}
