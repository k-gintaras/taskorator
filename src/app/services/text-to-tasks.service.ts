import { Injectable } from '@angular/core';
import { Task, getDefaultTask } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TextToTasksService {
  getLinesToTaskObjects(text: string): Task[] {
    const tasks: Task[] = [];
    const listData = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    listData.forEach((line) => {
      const separator = this.getSeparator(line);
      const taskArr = line.split(separator);
      let name = '';
      let todo = '';

      if (taskArr.length >= 3) {
        name = taskArr.slice(0, 3).join(' '); // Consider the first three words as the name
        todo = taskArr.slice(3).join(separator); // Whatever is left becomes the todo
      } else {
        name = line; // If less than three words, consider the whole line as the name
      }

      // Perform further processing with the extracted name and todo
      const task: Task = this.processTask(name, todo);
      task.type = 'note';
      tasks.push(task);
    });

    return tasks;
  }

  getCodeToTaskObjects(text: string): Task[] {
    const tasks: Task[] = [];
    const listData = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    listData.forEach((line) => {
      const task: Task = this.processTask(line, 'assign parent');
      task.type = 'code';
      tasks.push(task);
    });

    return tasks;
  }

  getSeparator(line: string) {
    const commasCount = line.split(',').length;
    const spaceCount = line.split(' ').length;
    return spaceCount > commasCount ? ' ' : ',';
  }

  getLineToTaskObject(text: string): Task {
    console.log('Processing Single Line:', text);
    const separator = this.getSeparator(text);
    const taskArr = text.split(separator);
    let name = '';
    let todo = '';

    if (taskArr.length >= 3) {
      name = taskArr.slice(0, 3).join(' '); // Consider the first three words as the name
      todo = taskArr.slice(3).join(separator); // Whatever is left becomes the todo
    } else {
      name = text; // If less than three words, consider the whole line as the name
    }

    // Perform further processing with the extracted name and todo
    return this.processTask(name, todo);
  }

  processTask(name: string, todo: string) {
    console.log('Processing Task:', name + ' --- ' + todo);
    const task = this.loadTaskObject(name, todo);
    return task;
  }

  loadTaskObject(name: string, todo: string) {
    const t = getDefaultTask();
    t.name = name;
    t.todo = todo;
    return t;
  }
}
