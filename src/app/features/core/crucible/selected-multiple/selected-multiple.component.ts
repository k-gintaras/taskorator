
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StagedTaskListComponent } from '../../../../components/task/staged-task-list/staged-task-list.component';
import { MatIcon } from '@angular/material/icon';
import { UiTask, TaskoratorTask } from '../../../../models/taskModelManager';
import { TaskUiInteractionService } from '../../../../services/tasks/task-list/task-ui-interaction.service';
import { TaskListCoordinatorService } from '../../../../services/tasks/task-list/task-list-coordinator.service';
import { TaskUiDecoratorService } from '../../../../services/tasks/task-list/task-ui-decorator.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-selected-multiple',
  standalone: true,
  imports: [
    StagedTaskListComponent,
    MatIcon
],
  templateUrl: './selected-multiple.component.html',
  styleUrls: ['./selected-multiple.component.scss'],
})
export class SelectedMultipleComponent implements OnInit, OnDestroy {
  selectedTasks: UiTask[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private taskUiInteractionService: TaskUiInteractionService,
    private taskUiDecoratorService: TaskUiDecoratorService,
    private taskListCoordinator: TaskListCoordinatorService
  ) {}

  ngOnInit() {
    this.refreshSelectedTasks();
    this.taskUiDecoratorService.selectedTasksChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshSelectedTasks());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async refreshSelectedTasks() {
    const ids = this.taskUiInteractionService.getSelectedTaskIds();
    this.selectedTasks = await this.taskListCoordinator.getTasksByIds(ids);
  }

  updateSelectedTasks(updatedTasks: TaskoratorTask[]): void {
    this.selectedTasks = updatedTasks as UiTask[];
    // Update the selection to match
    this.taskUiInteractionService.clearSelection();
    for (const task of updatedTasks) {
      this.taskUiInteractionService.select(task.taskId);
    }
  }
}
