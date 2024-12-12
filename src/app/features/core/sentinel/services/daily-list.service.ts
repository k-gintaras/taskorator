import { Injectable } from '@angular/core';
import { RepeatListService } from './repeat-list.service';
import { Task } from '../../../../models/taskModelManager';
import { EventBusService } from '../../../../services/core/event-bus.service';
import { TaskListService } from '../../../../services/tasks/task-list.service';
import { TaskListAssistantApiService } from '../../../../services/api/task-list-assistant-api.service';

@Injectable({
  providedIn: 'root',
})
export class DailyListService extends RepeatListService {
  constructor(
    private taskListService: TaskListService,
    taskListAssistant: TaskListAssistantApiService,
    eventBus: EventBusService
  ) {
    super(taskListAssistant, eventBus);
  }

  protected override fetchTasks(): Promise<Task[] | null> {
    if (!this.taskListService) return Promise.resolve(null);

    return this.taskListService.getDailyTasks();
  }
  protected override getRepeatType(): string {
    return 'daily';
  }
}
