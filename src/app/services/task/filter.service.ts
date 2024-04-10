import { Injectable } from '@angular/core';
import { Settings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  filterBySettings(tasks: Task[], settings: Settings): Task[] {
    return tasks.filter((t: Task) => {
      // Task should be included if it matches any of the criteria for being shown
      return (
        (settings.isShowArchived && t.stage === 'archived') ||
        (settings.isShowCompleted && t.stage === 'completed') ||
        (settings.isShowSeen && t.stage === 'seen') ||
        (settings.isShowDeleted && t.stage === 'deleted') ||
        (settings.isShowTodo && t.stage === 'todo') ||
        // If none of the settings apply, it means we don't want to filter this task out based on its stage
        // This line is necessary if there are stages not covered by the settings, adjust as needed
        (!settings.isShowArchived &&
          !settings.isShowCompleted &&
          !settings.isShowSeen &&
          !settings.isShowDeleted &&
          !settings.isShowTodo)
      );
    });
  }
}
