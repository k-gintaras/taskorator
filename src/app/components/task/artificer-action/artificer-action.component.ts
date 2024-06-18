import { Component, Input } from '@angular/core';
import { Task } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { ArtificerDetails } from '../../artificer/artificer.interface';
import { ArtificerService } from '../../artificer/artificer.service';
import { NgClass, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-artificer-action',
  standalone: true,
  imports: [NgClass, MatIcon],
  templateUrl: './artificer-action.component.html',
  styleUrl: './artificer-action.component.scss',
})
export class ArtificerActionComponent {
  @Input() task: Task | undefined;
  currentAction!: ArtificerDetails;

  constructor(
    private taskUpdateService: TaskUpdateService,
    private artificerService: ArtificerService
  ) {
    this.artificerService.currentAction$.subscribe((action) => {
      this.currentAction = action;
    });
  }

  performAction(): void {
    const task = this.task;
    if (!task) return;
    const action = this.currentAction.action;

    switch (action) {
      case 'delete':
        this.taskUpdateService.delete(task);
        break;
      case 'complete':
        this.taskUpdateService.complete(task);
        break;
      case 'refresh':
        this.taskUpdateService.renew(task);
        break;
      // Add more cases as needed...
      default:
        break;
    }
  }
}
