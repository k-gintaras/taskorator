import { Injectable } from '@angular/core';
import { Task } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class TaskValidatorService {
  isTaskValid(task: Task) {
    if (!this.isTaskParametersValid(task)) return false;
    return true;
  }

  isTaskParametersValid(task: Task) {
    if (task.name.length < 1) return false;
    return true;
  }
}
