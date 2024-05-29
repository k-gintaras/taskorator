import { Injectable } from '@angular/core';
import { TaskSettings } from '../../models/settings';
import { Task } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  filterBySettings(tasks: Task[], settings: TaskSettings): Task[] {
    return tasks.filter((t: Task) => {
      const isRepeatingTask = t.repeat !== 'never' && t.repeat !== 'once';

      return (
        (settings.isShowArchived && t.stage === 'archived') ||
        (settings.isShowCompleted && t.stage === 'completed') ||
        (settings.isShowSeen && t.stage === 'seen') ||
        (settings.isShowDeleted && t.stage === 'deleted') ||
        (settings.isShowTodo && t.stage === 'todo') ||
        // Show completed repeating tasks if the setting is enabled
        (settings.isShowCompletedRepeating &&
          t.stage === 'completed' &&
          isRepeatingTask) ||
        // Default case for stages not covered by the settings
        (!settings.isShowArchived &&
          !settings.isShowCompleted &&
          !settings.isShowSeen &&
          !settings.isShowDeleted &&
          !settings.isShowTodo)
      );
    });
  }
}
