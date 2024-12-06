import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../../../../models/taskModelManager';
import { EventBusService } from '../../../../services/core/event-bus.service';
import { TaskListAssistantService } from '../../../../services/task/task-list/task-list-assistant.service';

@Injectable({
  providedIn: 'root',
})
export abstract class RepeatListService {
  private tasks$ = new BehaviorSubject<Task[]>([]);

  constructor(
    protected taskListAssistant: TaskListAssistantService,
    protected eventBus: EventBusService
  ) {
    this.loadTasks();
    this.subscribeToTaskEvents();
  }

  // Expose tasks as an observable
  getTasks(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  // Fetch and load tasks (implemented by child classes)
  protected async loadTasks(): Promise<void> {
    const tasks = await this.fetchTasks();
    console.log('!FETCHED');
    console.log(tasks);
    if (!tasks) return;
    const filteredTasks = this.taskListAssistant.filterTasks(
      tasks,
      true,
      this.getRepeatType()
    );
    this.tasks$.next(filteredTasks);
  }

  // Subscribe to task events for dynamic updates
  private subscribeToTaskEvents(): void {
    this.eventBus.onEvent<Task>('updateTask').subscribe((updatedTask) => {
      this.updateTask(updatedTask);
    });

    this.eventBus.onEvent<Task>('createTask').subscribe((newTask) => {
      this.addTask(newTask);
    });
  }

  // Update tasks (common logic)
  private updateTask(updatedTask: Task): void {
    if (updatedTask.repeat === this.getRepeatType()) {
      const tasks = this.tasks$.getValue();
      const index = tasks.findIndex(
        (task) => task.taskId === updatedTask.taskId
      );

      if (index !== -1) {
        tasks[index] = updatedTask;
        this.tasks$.next([...tasks]);
      }
    } else {
      this.removeTask(updatedTask);
    }
  }

  // Add task to the list
  private addTask(newTask: Task): void {
    if (newTask.repeat === this.getRepeatType()) {
      const tasks = this.tasks$.getValue();
      this.tasks$.next([...tasks, newTask]);
    }
  }

  // Remove task from the list
  private removeTask(taskToRemove: Task): void {
    const tasks = this.tasks$
      .getValue()
      .filter((task) => task.taskId !== taskToRemove.taskId);
    this.tasks$.next(tasks);
  }

  // Enforce specific rules for subclasses
  protected abstract fetchTasks(): Promise<Task[] | null>;
  protected abstract getRepeatType(): string; // Enforces the repeat type ("daily", "weekly", etc.)
}
