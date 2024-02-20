import { Injectable } from '@angular/core';
import { Task } from '../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TextToTasksService {
  constructor() {}

  processList(text: string) {
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
      this.processTask(name, todo);
    });

    console.log('Processing List:', listData);
  }

  getSeparator(line: string) {
    const commasCount = line.split(',').length;
    const spaceCount = line.split(' ').length;
    return spaceCount > commasCount ? ' ' : ',';
  }

  processSingleLine(text: string) {
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
    this.processTask(name, todo);
  }

  processTask(name: string, todo: string) {
    // Add your processing logic here for each task (name and todo)
    // For example, you can insert the task into the database or perform any other actions
    console.log('Processing Task:', name + ' --- ' + todo);
    const task = this.loadTaskObject(name, todo);
    // if (task.name) this.taskService.createTask(task).subscribe();
    // console.log('Saved: ' + task.name);
  }

  loadTaskObject(name: string, todo: string) {
    const t: Task = {
      taskId: 0,
      name: name,
      todo: todo ? todo : '',
      why: '',
      timeCreated: new Date(),
      timeEnd: null,
      duration: 0,
      overlord: 0,
      repeat: 'never',
      status: 'inactive',
      stage: 'todo',
      type: '',
      subtype: 'list',
      size: 'split',
      owner: 'Ubaby',
      priority: 0,
      backupLink: '',
      tags: [''],
      lastUpdated: null,
      imageUrl: null,
      imageDataUrl: null,
    };
    return t;
  }
}
