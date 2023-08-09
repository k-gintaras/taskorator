import { Injectable } from '@angular/core';
import {
  RepeatOptions,
  Task,
  TaskSize,
  TaskStatus,
  TaskSubtype,
  TaskType,
  maxPriority,
} from '../task-model/taskModelManager';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private sync: SyncService) {}

  /**
   * creation
   */
  create(task: Task) {
    this.sync.createTask(task).subscribe();
  }

  split(task: Task, taskOne: Task, taskTwo: Task) {
    taskOne.overlord = task.taskId;
    taskTwo.overlord = task.taskId;
    const name1 = task.name;
    const name2 = taskOne.name;
    const name3 = taskTwo.name;

    if (name1 !== name2 && name1 !== name3 && name2 !== name3) {
      this.sync.createTask(taskOne).subscribe();
      this.sync.createTask(taskTwo).subscribe();
    } else {
      console.log('task names are the same');
    }
  }

  addSubtask(taskTo: Task, subtask: Task) {
    subtask.overlord = taskTo.taskId;
    this.sync.createTask(subtask).subscribe();
  }

  update(task: Task) {
    this.sync.updateTask(task).subscribe();
  }

  /**
   * parent child management
   */
  setOverlord(task: Task, overlord: Task) {
    task.overlord = overlord.taskId;
    this.update(task);
  }

  /**
   * getting rid of tasks
   */
  complete(task: Task) {
    task.stage = 'completed';
    this.update(task);
  }

  archive(task: Task) {
    task.stage = 'archived';
    this.update(task);
  }

  /**
   * basically allow remove it for a moment, maybe day, maybe month... we are not sure
   * if set seen, and lets say last updated yesterday, show it, but if today, not show it?
   */
  setAsSeen(task: Task) {
    task.stage = 'seen';
    this.update(task);
  }

  activate(task: Task) {
    task.stage = 'todo';
    this.update(task);
  }

  /**
   * increase priority will be reset beyond max
   */
  increasePriority(task: Task) {
    if (task.priority < maxPriority) {
      task.priority++;
    } else {
      task.priority = 0;
    }
    this.update(task);
  }

  /**
   * decrease priority will be reset beyond max
   */
  decreasePriority(task: Task) {
    if (task.priority > 0) {
      task.priority--;
    } else {
      task.priority = maxPriority;
    }
    this.update(task);
  }

  /**
   * update
   */
  setWhy(task: Task, why: string) {
    task.why = why;
    this.update(task);
  }

  setTodo(task: Task, todo: string) {
    task.todo = todo;
    this.update(task);
  }

  setName(task: Task, name: string) {
    task.name = name;
    this.update(task);
  }

  /**
   * Add a tag to the specified task.
   */
  addTag(task: Task, tag: string) {
    if (!tag || tag.trim() === '') {
      // Invalid or empty tag, so we exit early.
      return;
    }

    // Ensure task.tags is initialized.
    if (!task.tags) {
      task.tags = [];
    }

    // Only add the tag if it doesn't already exist.
    if (!task.tags.includes(tag)) {
      task.tags.push(tag);
    }
  }

  /**
   * Remove a tag from the task with the specified taskId.
   */
  removeTag(task: Task, tag: string) {
    if (!task.tags || !tag) {
      // If tags are not initialized or the tag is invalid, we exit early.
      return;
    }

    const tagIndex = task.tags.indexOf(tag);

    // Remove the tag if it exists.
    if (tagIndex !== -1) {
      task.tags.splice(tagIndex, 1);
    }

    // If the tags array is empty after removing, set it to [] (optional).
    if (task.tags.length === 0) {
      task.tags = [];
    }
  }

  /**
   * images
   */
  setImageUrl(task: Task, imageUrl: string) {
    task.imageUrl = imageUrl;
    this.update(task);
  }

  setImageDataUrl(task: Task, imageDataUrl: string) {
    task.imageDataUrl = imageDataUrl;
    this.update(task);
  }

  /**
   * backup, github link
   */
  setBackupLink(task: Task, url: string) {
    task.backupLink = url;
    this.update(task);
  }

  /**
   * repetition
   */
  setRepeat(task: Task, repeat: RepeatOptions) {
    task.repeat = repeat;
    this.update(task);
  }

  setTimeEnd(task: Task, timeEnd: Date) {
    task.timeEnd = timeEnd;
    this.update(task);
  }

  /**
   * to calculate end date or to get it once time end is calculated
   */
  setDuration(task: Task, duration: number) {
    task.duration = duration;
    this.update(task);
  }

  /**
   * is it some project we want to do now or later, whether is actively in progress or not
   */
  setStatus(task: Task, status: TaskStatus) {
    task.status = status;
    this.update(task);
  }

  /**
   * what is the size or magnitude of the tasks, idea, project, task, todo
   */
  setType(task: Task, type: TaskType) {
    task.type = type;
    this.update(task);
  }

  /**
   * might be used in addition to parent child relation
   */
  setSubType(task: Task, subtype: TaskSubtype) {
    task.subtype = subtype;
    this.update(task);
  }

  /**
   * might be used to decide what action to take, if small do now, if big split if too big, delegate
   */
  setSize(task: Task, size: TaskSize) {
    task.size = size;
    this.update(task);
  }
}
