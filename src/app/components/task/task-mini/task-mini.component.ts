import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { CommonModule } from '@angular/common';
import { TaskListDataFacadeService } from '../../../services/tasks/task-list/task-list-data-facade.service';
import { ArtificerService } from '../../artificer/artificer.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-task-mini',
  standalone: true,
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
  imports: [CommonModule],
})
export class TaskMiniComponent {
  @Input() task: TaskoratorTask | undefined;
  @Input() disableClick: boolean = false;
  
  showPriority$: Observable<boolean>;

  constructor(
    private dataFacade: TaskListDataFacadeService,
    private artificerService: ArtificerService
  ) {
    // Show priority when artificer action is promote or demote
    this.showPriority$ = this.artificerService.currentAction$.pipe(
      map(action => action.action === 'promote' || action.action === 'demote')
    );
  }

  get overlordName(): string | null {
    return (this.task as any)?.overlordName || null;
  }

  onTaskCardClick(task: TaskoratorTask | undefined): void {
    if (!task || this.disableClick) return;
    this.dataFacade.toggleTaskSelection(task.taskId);
  }
}
