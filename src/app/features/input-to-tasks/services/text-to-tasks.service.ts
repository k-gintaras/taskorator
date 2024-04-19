import { Injectable } from '@angular/core';
import { getDefaultTask, Task } from 'src/app/models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TextToTasksService {
  getLinesToTaskObjects(text: string, isShortened: boolean): Task[] {
    const tasks: Task[] = [];
    const listData = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    listData.forEach((line) => {
      const separator = this.findCommonSeparator(line); // Function to find a common separator
      let name, todo;

      if (separator) {
        if (isShortened) {
          // Use text before the first separator as the name and the rest as todo
          [name, ...todo] = line.split(separator);
          todo = todo.join(separator);
        } else {
          name = line;
          todo = '';
        }
      } else {
        // Use the first 3 words as the name, rest as todo
        const words = line.split(' ');
        if (isShortened) {
          name = words.slice(0, 3).join(' ');
          todo = words.slice(3).join(' ');
        } else {
          name = line;
          todo = '';
        }
      }

      // Create and push the new task
      const task: Task = this.processTask(name, todo);
      task.type = 'note';
      tasks.push(task);
    });

    return tasks;
  }

  // Function to identify common separators in a string, returns the first one found
  findCommonSeparator(str: string): string | null {
    const separators = [',', ';', '|'];
    for (const sep of separators) {
      if (str.includes(sep)) {
        return sep;
      }
    }
    return null;
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

  getLineToTaskObject(text: string, isShortened: boolean): Task {
    const separator = this.getSeparator(text);
    const taskArr = text.split(separator);
    let name = '';
    let todo = '';

    if (isShortened) {
      if (taskArr.length >= 3) {
        name = taskArr.slice(0, 3).join(' '); // Consider the first three words as the name
        todo = taskArr.slice(3).join(separator); // Whatever is left becomes the todo
      } else {
        name = text; // If less than three words, consider the whole line as the name
      }
    } else {
      name = text;
      todo = '';
    }

    // Perform further processing with the extracted name and todo
    return this.processTask(name, todo);
  }

  processTask(name: string, todo: string) {
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
