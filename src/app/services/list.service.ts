import { Injectable } from '@angular/core';
import { TaskList } from '../task-model/taskListModel';
import { Task } from '../task-model/taskModelManager';
import { FilterHelperService } from './filter-helper.service';
import { TaskService } from './task.service';
import { FeedbackService } from './feedback.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  lists: TaskList[] = [];
  browserTasks: Task[] | undefined = [];

  constructor(
    private filters: FilterHelperService,
    private taskService: TaskService,
    private feedbackService: FeedbackService
  ) {}

  getBlankList(): TaskList {
    const list: TaskList = {
      title: '',
      tasks: [],
      actionName: '',
      onButtonClick: (task: Task) => {
        console.log('onButtonClick: ' + task.name);
      },
      onTaskSelected: (task: Task) => {
        console.log('onSelected: ' + task.name);
      },
    };

    return list;
  }

  getSubtasks(allTasks: Task[] | undefined, overlordTask: Task | null) {
    if (!allTasks) {
      return;
    }
    if (!overlordTask) {
      return;
    }
    let tasksThisWeek = this.filters.getTasksByOverlordId(
      overlordTask.taskId,
      allTasks
    );
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'Subtasks:',
      tasks: tasksThisWeek,
      actionName: 'done',
      onButtonClick: (task: Task) => {
        console.log('weekly ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('weekly ing a task ');
      },
    };

    return list;
  }

  getWeekly(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    let tasksThisWeek = this.filters.getTasksCreatedThisWeek(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'This Week:',
      tasks: tasksThisWeek,
      actionName: 'done',
      onButtonClick: (task: Task) => {
        console.log('weekly ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('weekly ing a task ');
      },
    };

    return list;
  }

  getAll(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    const list: TaskList = {
      title: 'All',
      tasks: allTasks,
      actionName: 'all',
      onButtonClick: (task: Task) => {
        console.log('all ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('select all ing a task ');
      },
    };

    return list;
  }

  getWithNoSubtasks(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    let tasksThisWeek = this.filters.getSemiOverlords(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'No Subtasks:',
      tasks: tasksThisWeek,
      actionName: 'Subtasks',
      onButtonClick: (task: Task) => {
        console.log('Subtasks ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks ing a task ');
      },
    };

    return list;
  }

  getHigherPriority(allTasks: Task[]) {
    let tasksThisWeek = this.filters.getHigherPriorityFiltered(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'Priority:',
      tasks: tasksThisWeek,
      actionName: 'Priority',
      onButtonClick: (task: Task) => {
        console.log('Priority ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('select Priority ing a task ');
      },
    };

    return list;
  }

  getWithSubtasks(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    let tasksThisWeek = this.filters.getOverlords(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'With Subtasks:',
      tasks: tasksThisWeek,
      actionName: 'Subtasks 2',
      onButtonClick: (task: Task) => {
        console.log('Subtasks2 ing a task ');
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  getArchived(allTasks: Task[]) {
    let tasksThisWeek = this.filters.getArchived(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'Archived:',
      tasks: tasksThisWeek,
      actionName: 'Delete',
      onButtonClick: (task: Task) => {
        console.log('deleting ing a task ');
        this.taskService.delete(task);
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  getDaily(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    let tasksThisWeek = this.filters.getDailyRepeat(allTasks);
    if (!tasksThisWeek) {
      tasksThisWeek = []; // Default to an empty array if it's undefined
    }

    const list: TaskList = {
      title: 'Daily:',
      tasks: tasksThisWeek,
      actionName: 'Seen',
      onButtonClick: (task: Task) => {
        console.log('seen a task ');
        this.taskService.setAsSeen(task);
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  getToArchive(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    const list: TaskList = {
      title: 'To Archive:',
      tasks: allTasks,
      actionName: 'Archive',
      onButtonClick: (task: Task) => {
        this.feedback('archived: ' + task.name, false);
        this.taskService.archive(task);
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  getOverlordBrowser(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    if (!this.browserTasks) {
      return;
    }
    this.browserTasks = allTasks;

    const list: TaskList = {
      title: 'Overlord Browser:',
      tasks: this.browserTasks,
      actionName: 'Back',
      onButtonClick: (task: Task) => {
        this.feedback('go back frm: ' + task.name, false);

        // Check the overlord of this task
        const overlordId = task.overlord;

        // If this task has an overlord
        if (overlordId) {
          // Fetch the overlord task
          const overlordTask = allTasks.find((t) => t.taskId === overlordId);

          // If the overlord task exists and it has an overlord itself
          if (overlordTask && overlordTask.overlord) {
            // Fetch all tasks that have the same overlord as the overlordTask
            this.browserTasks = allTasks.filter(
              (t) => t.overlord === overlordTask.overlord
            );
          } else if (overlordTask) {
            // Otherwise, just show the overlordTask
            this.browserTasks = [overlordTask];
          }
        }
      },
      onTaskSelected: (task: Task) => {
        // Fetch all tasks that have the current task as their overlord
        this.browserTasks = [
          ...allTasks.filter((t) => t.overlord === task.taskId),
        ];
        console.log(allTasks.length);
        console.log(this.browserTasks.length);
      },
    };

    return list;
  }

  getToRenew(allTasks: Task[] | undefined) {
    if (!allTasks) {
      return;
    }
    const list: TaskList = {
      title: 'To Renew:',
      tasks: allTasks,
      actionName: 'Renew',
      onButtonClick: (task: Task) => {
        this.feedback('Renewed: ' + task.name, false);
        this.taskService.renew(task);
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  getToComplete(allTasks: Task[]) {
    const list: TaskList = {
      title: 'Complete:',
      tasks: allTasks,
      actionName: 'Complete',
      onButtonClick: (task: Task) => {
        this.feedback('Completed: ' + task.name, false);
        this.taskService.complete(task);
      },
      onTaskSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }

  feedback(s: string, isError: boolean) {
    this.feedbackService.sendFeedback(s, isError);
  }
}
