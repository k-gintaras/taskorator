import { Injectable } from '@angular/core';
import { RepeatListService } from './repeat-list.service';
import { Task } from '../../../../models/taskModelManager';
import { EventBusService } from '../../../../services/core/event-bus.service';
import { TaskListAssistantService } from '../../../../services/task/task-list/task-list-assistant.service';
import { TaskListService } from '../../../../services/task/task-list/task-list.service';

@Injectable({
  providedIn: 'root',
})
export class DailyListService extends RepeatListService {
  constructor(
    private taskListService: TaskListService,
    taskListAssistant: TaskListAssistantService,
    eventBus: EventBusService
  ) {
    super(taskListAssistant, eventBus);
  }

  protected override fetchTasks(): Promise<Task[] | null> {
    if (!this.taskListService) return Promise.resolve(null);

    return this.taskListService.getDailyTasksFiltered();
  }
  protected override getRepeatType(): string {
    return 'daily';
  }
}
