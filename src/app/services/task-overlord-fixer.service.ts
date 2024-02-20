import { Injectable } from '@angular/core';
import {
  RepeatOptions,
  Task,
  TaskSize,
  TaskStage,
  TaskStatus,
  TaskSubtype,
  TaskType,
} from '../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskOverlordFixerService {
  fixEscapes(tasks: Task[]) {
    function fixFields(task: Task): Task {
      const fixString = (value: string | undefined | number | null): string => {
        if (typeof value === 'string') {
          return value.replace(/\\/g, '').replace(/"/g, '');
        }
        return value?.toString() || ''; // Return an empty string if value is undefined, null, or a number
      };

      return {
        ...task,
        name: fixString(task.name),
        todo: fixString(task.todo),
        why: fixString(task.why),
        repeat: fixString(task.repeat) as RepeatOptions,
        status: fixString(task.status) as TaskStatus,
        stage: fixString(task.stage) as TaskStage,
        type: fixString(task.type) as TaskType,
        subtype: fixString(task.subtype) as TaskSubtype,
        size: fixString(task.size) as TaskSize,
        owner: fixString(task.owner),
        backupLink: fixString(task.backupLink),
        tags: task.tags ? task.tags.map((tag) => fixString(tag)) : [],
      };
    }

    const fixedTasks = tasks.map((task) => fixFields(task));

    return fixedTasks;
  }

  fixTasks(tasks: Task[]) {
    tasks.forEach((task) => {
      // if task overlord is a number, do nothing
      if (typeof task.overlord === 'number') {
        if (task.overlord > 0) {
          return;
        }
      }

      // if task overlord is a string, find overlord id with that name
      const overlordId = this.getTaskIdByName(task.overlord, tasks);

      // if overlord id is found, assign overlord id
      if (overlordId !== null) {
        task.overlord = overlordId;
      } else {
        // if task has no overlord, try to find overlord id based on other properties

        // check if it has type, find overlord id with that type
        // if (task.type) {
        //   const overlordIdWithType = this.getTaskIdByType(task.type, tasks);
        //   if (overlordIdWithType !== null) {
        //     task.overlord = overlordIdWithType;
        //     return;
        //   }
        // }

        // // if no type, try tags, find overlord id with tags
        // if (task.tags && task.tags.length > 0) {
        //   const overlordIdWithTags = this.getTaskIdByTags(task.tags, tasks);
        //   if (overlordIdWithTags !== null) {
        //     task.overlord = overlordIdWithTags;
        //     return;
        //   }
        // }

        // if no tags, try subtype, find overlord id with subtype
        // if (task.subtype) {
        //   const overlordIdWithSubtype = this.getTaskIdBySubtype(
        //     task.subtype,
        //     tasks
        //   );
        //   if (overlordIdWithSubtype !== null) {
        //     task.overlord = overlordIdWithSubtype;
        //     return;
        //   }
        // }

        // if no subtype, try owner, find overlord id with owner
        // if (task.owner) {
        //   const overlordIdWithOwner = this.getTaskIdByOwner(task.owner, tasks);
        //   if (overlordIdWithOwner !== null) {
        //     task.overlord = overlordIdWithOwner;
        //     return;
        //   }
        // }

        // if none found, just add an overlord id with name 'todo'
        const todoOverlordId = this.getTaskIdByName('todo', tasks);
        if (todoOverlordId !== null) {
          task.overlord = todoOverlordId;
        } else {
          // If there is no task with name 'todo', you can set a default value or handle it as needed.
          task.overlord = '-1'; // Default overlord ID when 'todo' is not found.
        }
      }
    });
  }

  getTaskIdByName(name: string | number | null, tasks: Task[]): string | null {
    if (!name) {
      return null;
    }
    const foundTask = tasks.find((task) => task.name === name);
    return foundTask ? foundTask.taskId : null;
  }

  getTaskIdByType(type: string, tasks: Task[]): string | null {
    const foundTask = tasks.find((task) => task.type === type);
    return foundTask ? foundTask.taskId : null;
  }

  getTaskIdByTags(tags: string[], tasks: Task[]): string | null {
    const foundTask = tasks.find((task) => this.compareArrays(task.tags, tags));
    return foundTask ? foundTask.taskId : null;
  }

  getTaskIdBySubtype(subtype: string, tasks: Task[]): string | null {
    const foundTask = tasks.find((task) => task.subtype === subtype);
    return foundTask ? foundTask.taskId : null;
  }

  getTaskIdByOwner(owner: string, tasks: Task[]): string | null {
    const foundTask = tasks.find((task) => task.owner === owner);
    return foundTask ? foundTask.taskId : null;
  }

  compareArrays(arr1: string[], arr2: string[]): boolean {
    return (
      arr1.length === arr2.length &&
      arr1.every((value, index) => value === arr2[index])
    );
  }
}
