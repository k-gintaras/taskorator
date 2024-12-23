import { Injectable } from '@angular/core';
import {
  Task,
  maxPriority,
  RepeatOptions,
  TaskStatus,
  TaskType,
  TaskSubtype,
  TaskSize,
  TASK_ACTIONS,
} from '../../models/taskModelManager';
import { CoreService } from '../core/core.service';
import { ConfigService } from '../core/config.service';
import { SelectedMultipleService } from './selected-multiple.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { SettingsService } from '../core/settings.service';
import { TaskSettings } from '../../models/settings';
import { TaskService } from '../tasks/task.service';
import { TaskBatchService } from '../tasks/task-batch.service';
import {
  TaskActions,
  TaskActionTrackerService,
} from '../tasks/task-action-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class TaskUpdateService extends CoreService {
  constructor(
    private taskService: TaskService,
    private taskBatchService: TaskBatchService,
    private selectedService: SelectedMultipleService,
    private settingsService: SettingsService,
    private actionService: TaskActionTrackerService,
    protected config: ConfigService
  ) {
    super(config);
  }

  move(targetTask: Task) {
    firstValueFrom(this.selectedService.getSelectedTasks()).then(
      (selectedTasks) => {
        if (selectedTasks.length > 0 && targetTask.taskId) {
          for (const task of selectedTasks) {
            task.overlord = targetTask.taskId;
          }

          this.taskBatchService.updateTaskBatch(
            selectedTasks,
            TaskActions.MOVED,
            targetTask.taskId
          );
          this.clearSelectedTasks();
          this.feedback('Updated multiple tasks.');
        } else {
          this.error(
            "Can't update empty tasks or failed to create new overlord."
          );
        }
      }
    );
  }

  private clearSelectedTasks() {
    this.settingsService.getSettingsOnce().then((s: TaskSettings | null) => {
      if (s) {
        if (s.moveTasksOnce) {
          this.selectedService.clear();
        }
      }
    });
  }

  split(task: Task, taskOne: Task, taskTwo: Task) {
    taskOne.overlord = task.taskId;
    taskTwo.overlord = task.taskId;
    const name1 = task.name;
    const name2 = taskOne.name;
    const name3 = taskTwo.name;

    if (name1 !== name2 && name1 !== name3 && name2 !== name3) {
      this.taskBatchService
        .createTaskBatch([taskOne, taskTwo], task.taskId)
        .then(() => {
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
      this.actionService.recordAction(task.taskId, TaskActions.CREATED);
    });
  }

  addSubtask(taskTo: Task, subtask: Task) {
    subtask.overlord = taskTo.taskId;
    this.create(subtask);
  }

  update(task: Task, action: TaskActions, subAction?: any) {
    task.lastUpdated = Date.now();
    this.taskService.updateTask(task).then(() => {
      this.log('Updated: ' + task.name + ' at ' + task.lastUpdated);
      this.actionService.recordAction(task.taskId, action, subAction);
    });
  }

  /**
   * parent child management
   */
  setOverlord(task: Task, overlord: Task) {
    task.overlord = overlord.taskId;
    this.update(task, TaskActions.MOVED, overlord.taskId);
  }

  /**
   * getting rid of tasks
   */
  complete(task: Task) {
    // if (task.stage === 'completed') {
    //   task.stage = 'todo';
    //   this.log('Todo: ' + task.name);
    //   this.update(task, TaskActions.ACTIVATED);
    // } else {
    //   task.stage = 'completed';
    //   this.log('Completed: ' + task.name);
    //   this.update(task, TaskActions.COMPLETED);
    // }

    // TODO: figure out how to handle SEEN...
    task.stage = 'completed';
    this.log('Completed: ' + task.name);
    this.update(task, TaskActions.COMPLETED);
  }

  archive(task: Task) {
    task.stage = 'archived';
    this.update(task, TaskActions.ARCHIVED);
    this.log('Archived: ' + task.name);
  }

  delete(task: Task) {
    task.stage = 'deleted';
    this.update(task, TaskActions.DELETED);
    this.log('Deleted: ' + task.name + ' at ' + task.lastUpdated);
  }

  renew(task: Task) {
    task.stage = 'todo';
    this.update(task, TaskActions.RENEWED);
    this.log('Renewed: ' + task.name);
  }

  /**
   * basically allow remove it for a moment, maybe day, maybe month... we are not sure
   * if set seen, and lets say last updated yesterday, show it, but if today, not show it?
   */
  setAsSeen(task: Task) {
    task.stage = 'seen';
    this.update(task, TaskActions.SEEN);
    this.log('Seen: ' + task.name);
  }

  activate(task: Task) {
    task.stage = 'todo';
    this.update(task, TaskActions.ACTIVATED);
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
    this.update(task, TaskActions.PRIORITY_INCREASED);
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
    this.update(task, TaskActions.PRIORITY_DECREASED);
    this.log('Priority decreased: ' + task.name);
  }

  /**
   * update
   */
  setWhy(task: Task, why: string) {
    task.why = why;
    this.update(task, TaskActions.WHY_UPDATED);
    this.log('Why updated: ' + task.name);
  }

  setTodo(task: Task, todo: string) {
    task.todo = todo;
    this.update(task, TaskActions.TODO_UPDATED);
    this.log('Todo updated: ' + task.name);
  }

  setName(task: Task, name: string) {
    task.name = name;
    this.update(task, TaskActions.NAME_UPDATED);
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
    this.update(task, TaskActions.TAG_ADDED);
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
    this.update(task, TaskActions.TAG_REMOVED);
  }

  /**
   * images
   */
  setImageUrl(task: Task, imageUrl: string) {
    task.imageUrl = imageUrl;
    this.update(task, TaskActions.IMAGE_UPDATED);
    this.log('Image url updated: ' + task.name);
  }

  setImageDataUrl(task: Task, imageDataUrl: string) {
    task.imageDataUrl = imageDataUrl;
    this.update(task, TaskActions.IMAGE_UPDATED);
    this.log('Image updated: ' + task.name);
  }

  /**
   * backup, github link
   */
  setBackupLink(task: Task, url: string) {
    task.backupLink = url;
    this.update(task, TaskActions.BACKUP_LINK_UPDATED);
    this.log('Backup link updated: ' + task.name);
  }

  /**
   * repetition
   */
  setRepeat(task: Task, repeat: RepeatOptions) {
    task.repeat = repeat;
    this.update(task, TaskActions.REPEAT_UPDATED, repeat);
    this.log('Updated repeat: ' + task.name);
  }

  setTimeEnd(task: Task, timeEnd: number) {
    task.timeEnd = timeEnd;
    this.update(task, TaskActions.TIME_END_UPDATED, timeEnd);
    this.log('Updated time end: ' + task.name);
  }

  /**
   * to calculate end date or to get it once time end is calculated
   */
  setDuration(task: Task, duration: number) {
    task.duration = duration;
    this.update(task, TaskActions.DURATION_UPDATED, duration);
    this.log('Updated duration: ' + task.name);
  }

  /**
   * is it some project we want to do now or later, whether is actively in progress or not
   */
  setStatus(task: Task, status: TaskStatus) {
    task.status = status;
    this.update(task, TaskActions.STATUS_UPDATED, status);
    this.log('Updated status: ' + task.name);
  }

  /**
   * what is the size or magnitude of the tasks, idea, project, task, todo
   */
  setType(task: Task, type: TaskType) {
    task.type = type;
    this.update(task, TaskActions.TYPE_UPDATED, type);
    this.log('Updated type: ' + task.name);
  }

  /**
   * might be used in addition to parent child relation
   */
  setSubType(task: Task, subtype: TaskSubtype) {
    task.subtype = subtype;
    this.update(task, TaskActions.SUBTYPE_UPDATED, subtype);
    this.log('Updated subtype: ' + task.name);
  }

  /**
   * might be used to decide what action to take, if small do now, if big split if too big, delegate
   */
  setSize(task: Task, size: TaskSize) {
    task.size = size;
    this.update(task, TaskActions.SIZE_UPDATED, size);
    this.log('Updated size: ' + task.name);
  }
}
