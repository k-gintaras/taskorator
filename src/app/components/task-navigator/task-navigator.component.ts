import { Component, OnInit } from '@angular/core';
import { UiTask } from '../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { ErrorService } from '../../services/core/error.service';
import { TaskNavigatorService } from '../../services/tasks/task-navigation/task-navigator.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskListDataFacadeService } from '../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    TaskEditComponent,
    TaskCardComponent,
    TaskListItemComponent,
  ],
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.tailwind.html',
  styleUrls: ['./task-navigator.component.scss'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: UiTask[] | null = null;
  selectedOverlord: UiTask | null = null;

  constructor(
    private navigatorService: TaskNavigatorService,
    private selectedOverlordService: SelectedOverlordService,
    private taskListFacade: TaskListDataFacadeService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.taskListFacade.currentTasks$.subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord) => {
        this.selectedOverlord = overlord;
      });
  }

  async onNext(task: UiTask): Promise<void> {
    try {
      await this.navigatorService.navigateInToTask(task.taskId);
    } catch (error: any) {
      this.errorService.warn('Failed to navigate to next tasks.');
    }
  }
}
