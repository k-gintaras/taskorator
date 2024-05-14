import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import {
  Task,
  maxPriority,
  RepeatOptions,
  TaskStatus,
  TaskType,
  TaskSubtype,
  TaskSize,
} from '../../models/taskModelManager';
import { CoreService } from '../core/core.service';
import { ConfigService } from '../core/config.service';

@Injectable({
  providedIn: 'root',
})
export class TaskUpdateService extends CoreService {
  constructor(
    private taskService: TaskService,
    protected config: ConfigService
  ) {
    super(config);
  }

  split(task: Task, taskOne: Task, taskTwo: Task) {
    taskOne.overlord = task.taskId;
    taskTwo.overlord = task.taskId;
    const name1 = task.name;
    const name2 = taskOne.name;
    const name3 = taskTwo.name;

    if (name1 !== name2 && name1 !== name3 && name2 !== name3) {
      this.taskService.createTasks([taskOne, taskTwo]).then(() => {
        this.log('Tasks split');
      });
    } else {
      this.error('task names are the same');
    }
  }

  create(task: Task) {
    task.timeCreated = Date.now();
    this.taskService.createTask(task).then((createdTask: Task) => {
      this.log('Created: ' + createdTask.taskId + ' ' + createdTask.name);
    });
  }

  addSubtask(taskTo: Task, subtask: Task) {
    subtask.overlord = taskTo.taskId;
    this.create(subtask);
  }

  update(task: Task) {
    task.lastUpdated = Date.now();
    this.taskService.updateTask(task).then(() => {
      this.log('Updated: ' + task.name);
    });
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
    // if task is already completed
    // uncomplete
    if (task.stage === 'completed') {
      task.stage = 'todo';
    } else {
      task.stage = 'completed';
    }
    this.update(task);
    this.log('Completed: ' + task.name);
  }

  archive(task: Task) {
    task.stage = 'archived';
    this.update(task);
    this.log('Archived: ' + task.name);
  }

  delete(task: Task) {
    task.stage = 'deleted';
    this.update(task);
    this.log('Deleted: ' + task.name);
  }

  renew(task: Task) {
    task.stage = 'todo';
    this.update(task);
    this.log('Renewed: ' + task.name);
  }

  /**
   * basically allow remove it for a moment, maybe day, maybe month... we are not sure
   * if set seen, and lets say last updated yesterday, show it, but if today, not show it?
   */
  setAsSeen(task: Task) {
    task.stage = 'seen';
    this.update(task);
    this.log('Seen: ' + task.name);
  }

  activate(task: Task) {
    task.stage = 'todo';
    this.update(task);
    this.log('Activated: ' + task.name);
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
    this.log('Priority increased: ' + task.name);
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
    this.log('Priority decreased: ' + task.name);
  }

  /**
   * update
   */
  setWhy(task: Task, why: string) {
    task.why = why;
    this.update(task);
    this.log('Why updated: ' + task.name);
  }

  setTodo(task: Task, todo: string) {
    task.todo = todo;
    this.update(task);
    this.log('Todo updated: ' + task.name);
  }

  setName(task: Task, name: string) {
    task.name = name;
    this.update(task);
    this.log('Name Updated: ' + task.name);
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
    this.log('Image url updated: ' + task.name);
  }

  setImageDataUrl(task: Task, imageDataUrl: string) {
    task.imageDataUrl = imageDataUrl;
    this.update(task);
    this.log('Image updated: ' + task.name);
  }

  /**
   * backup, github link
   */
  setBackupLink(task: Task, url: string) {
    task.backupLink = url;
    this.update(task);
    this.log('Backup link updated: ' + task.name);
  }

  /**
   * repetition
   */
  setRepeat(task: Task, repeat: RepeatOptions) {
    task.repeat = repeat;
    this.update(task);
    this.log('Updated repeat: ' + task.name);
  }

  setTimeEnd(task: Task, timeEnd: number) {
    task.timeEnd = timeEnd;
    this.update(task);
    this.log('Updated time end: ' + task.name);
  }

  /**
   * to calculate end date or to get it once time end is calculated
   */
  setDuration(task: Task, duration: number) {
    task.duration = duration;
    this.update(task);
    this.log('Updated duration: ' + task.name);
  }

  /**
   * is it some project we want to do now or later, whether is actively in progress or not
   */
  setStatus(task: Task, status: TaskStatus) {
    task.status = status;
    this.update(task);
    this.log('Updated status: ' + task.name);
  }

  /**
   * what is the size or magnitude of the tasks, idea, project, task, todo
   */
  setType(task: Task, type: TaskType) {
    task.type = type;
    this.update(task);
    this.log('Updated type: ' + task.name);
  }

  /**
   * might be used in addition to parent child relation
   */
  setSubType(task: Task, subtype: TaskSubtype) {
    task.subtype = subtype;
    this.update(task);
    this.log('Updated subtype: ' + task.name);
  }

  /**
   * might be used to decide what action to take, if small do now, if big split if too big, delegate
   */
  setSize(task: Task, size: TaskSize) {
    task.size = size;
    this.update(task);
    this.log('Updated size: ' + task.name);
  }
}
