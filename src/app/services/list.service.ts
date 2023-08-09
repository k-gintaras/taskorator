import { Injectable } from '@angular/core';
import { TaskList } from '../task-model/taskListModel';
import { Task } from '../task-model/taskModelManager';
import { FilterHelperService } from './filter-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  lists: TaskList[] = [];

  constructor(private filters: FilterHelperService) {}

  getList(name: string): TaskList[] {
    return this.lists;
  }

  getWeekly(allTasks: Task[]) {
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
      onSelected: (task: Task) => {
        console.log('weekly ing a task ');
      },
    };

    return list;
  }

  getAll(allTasks: Task[]) {
    const list: TaskList = {
      title: 'All',
      tasks: allTasks,
      actionName: 'all',
      onButtonClick: (task: Task) => {
        console.log('all ing a task ');
      },
      onSelected: (task: Task) => {
        console.log('select all ing a task ');
      },
    };

    return list;
  }

  getWithNoSubtasks(allTasks: Task[]) {
    let tasksThisWeek = this.filters.getNonOverlordTasks(allTasks);
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
      onSelected: (task: Task) => {
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
      onSelected: (task: Task) => {
        console.log('select Priority ing a task ');
      },
    };

    return list;
  }

  getWithSubtasks(allTasks: Task[]) {
    let tasksThisWeek = this.filters.getOverlordTasks(allTasks);
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
      onSelected: (task: Task) => {
        console.log('select Subtasks2 ing a task ');
      },
    };

    return list;
  }
}
