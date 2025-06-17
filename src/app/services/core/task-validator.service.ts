import { Injectable } from '@angular/core';
import { TaskoratorTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskValidatorService {
  isTaskValid(task: TaskoratorTask) {
    if (!this.isTaskParametersValid(task)) return false;
    return true;
  }

  isTaskParametersValid(task: TaskoratorTask) {
    if (task.name.length < 1) return false;
    return true;
  }
}
