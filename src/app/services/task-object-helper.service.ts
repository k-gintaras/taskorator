import { Injectable } from '@angular/core';
import { Task } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskObjectHelperService {
  getMostRecentTask(tasks: Task[] | undefined): Task | undefined {
    return tasks?.sort(
      (a, b) =>
        (b.timeCreated?.getTime() || 0) - (a.timeCreated?.getTime() || 0)
    )[0];
  }

  getTaskById(taskId: string | null, tasks: Task[]): Task | null {
    const index = tasks.findIndex((t: Task) => t.taskId === taskId);
    if (index !== -1) {
      return tasks[index];
    }
    return null;
  }

  getOverlord(task: Task, tasks: Task[]): Task | null {
    return this.getTaskById(task.overlord, tasks);
  }

  getTaskByName(name: string, tasks: Task[]): Task | null {
    const index = tasks.findIndex((t) => t.name === name);
    if (index !== -1) {
      return tasks[index];
    }
    return null;
  }

  getTasksByOverlordId(overlordId: string, tasks: Task[]): Task[] {
    return tasks.filter((task) => task.overlord === overlordId);
  }

  getTasksByNoOverlordId(overlordId: string, tasks: Task[]): Task[] {
    return tasks.filter((task) => task.overlord !== overlordId);
  }

  getTasksByNoOverlordIdAndItself(overlordId: string, tasks: Task[]): Task[] {
    return tasks.filter(
      (task) => task.overlord !== overlordId && task.taskId !== overlordId
    );
  }

  // getTasksByOverlordIdName(overlordName: string, tasks: Task[]): Task[] {
  //   return tasks.filter((task) => task.overlord === overlordName);
  // }

  getTasksByOverlordName(overlordName: string, tasks: Task[]): Task[] {
    const overlordTask = this.getTaskByName(overlordName, tasks);
    if (overlordTask) {
      return tasks.filter((task) => task.overlord === overlordTask.taskId);
    }
    return [];
  }

  getTasksByTags(tags: string[], tasks: Task[]): Task[] {
    return tasks.filter((task) => task.tags.some((tag) => tags.includes(tag)));
  }

  getTasksWithInvalidOverlord(tasks: Task[]): Task[] {
    return tasks.filter(
      (task) => typeof task.overlord !== 'number' || task.overlord === null
    );
  }

  getTasksWithEmptyTodo(tasks: Task[]): Task[] {
    return tasks.filter((task) => !task.todo || task.todo.trim() === '');
  }

  // Function to get Task[] sorted by timeCreated
  getTasksSortedByTimeCreated(tasks: Task[]): Task[] {
    // Sort the tasks array based on the timeCreated property
    return tasks?.slice().sort((a, b) => {
      return (a.timeCreated?.getTime() || 0) - (b.timeCreated?.getTime() || 0);
    });
  }

  getTasksSortedByPriority(tasks: Task[]): Task[] {
    return tasks.slice().sort((a, b) => a.priority - b.priority);
  }
}
