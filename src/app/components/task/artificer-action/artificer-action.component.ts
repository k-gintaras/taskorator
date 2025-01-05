import { Component, Input } from '@angular/core';
import { Task } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { ArtificerDetails } from '../../artificer/artificer.interface';
import { ArtificerService } from '../../artificer/artificer.service';
import { NgClass, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TaskTreeNodeData } from '../../../models/taskTree';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { GptSuggestService } from '../../../services/tasks/gpt-suggest.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskEditPopupComponent } from '../task-edit-popup/task-edit-popup.component';
import { TaskActions } from '../../../services/tasks/task-action-tracker.service';
import { MassAddPopupComponent } from '../../mass-add-popup/mass-add-popup.component';

@Component({
  selector: 'app-artificer-action',
  standalone: true,
  imports: [NgClass, MatIcon, NgStyle],
  templateUrl: './artificer-action.component.html',
  styleUrl: './artificer-action.component.scss',
})
export class ArtificerActionComponent {
  @Input() task: Task | undefined;
  currentAction!: ArtificerDetails;
  @Input() treeNode: TaskTreeNodeData | undefined;
  @Input() protectTaskFromDelete: boolean = true;

  constructor(
    private taskUpdateService: TaskUpdateService,
    private artificerService: ArtificerService,
    private selectedService: SelectedMultipleService,
    private gptHelper: GptSuggestService,
    private dialog: MatDialog
  ) {
    this.artificerService.currentAction$.subscribe((action) => {
      this.currentAction = action;
    });
  }

  getColor() {
    if (!this.treeNode) return;
    // it is checklist and reappear whenever it repeats... daily, weekly
    const isRepeatingTask =
      this.task?.repeat !== 'never' && this.task?.repeat !== 'once';
    if (isRepeatingTask) return 'complete-icon-color-checklist';

    // show color based on what kind of task it is
    if (this.treeNode.childrenCount > 0) {
      // task has children
      if (this.treeNode.completedChildrenCount < this.treeNode.childrenCount) {
        // task has incomplete children
        return 'complete-icon-color-parent';
      }
    } else {
      // task has no children
      return 'complete-icon-color-child';
    }

    return 'complete-icon-color-child';
  }

  hasIncompleteChildren() {
    // fixed gives wrong answer for some reason
    // all tasks completed... maybe it includes itself?
    // tasks were not being sent to task tree because they were received as just taskId through eventbus
    if (!this.treeNode) return false;
    if (this.treeNode.childrenCount < 1) return false;
    if (this.treeNode.completedChildrenCount < this.treeNode.childrenCount)
      return true;

    return false;
  }

  getButtonStyle() {
    const action = this.currentAction.action;
    return this.isActionRestricted(action)
      ? { visibility: 'hidden', pointerEvents: 'none' }
      : {};
  }

  isActionRestricted(action: string): boolean {
    // we allow move, because we not moving it (which is not allowed), we moving tasks into it
    if (!this.protectTaskFromDelete) return false;
    return (
      this.hasIncompleteChildren() && ['delete', 'complete'].includes(action)
    );
  }

  performAction(): void {
    const task = this.task;
    if (!task) return;
    const action = this.currentAction.action;

    switch (action) {
      case 'promote':
        this.taskUpdateService.increasePriority(task);
        break;
      case 'demote':
        this.taskUpdateService.decreasePriority(task);
        break;
      case 'edit':
        this.editTask(task);
        break;
      case 'mass':
        this.mass(task);
        break;
      case 'select':
        this.selectedService.addRemoveSelectedTask(task);
        break;
      case 'suggest':
        this.gptHelper.suggestTasksForTask(task);
        break;

      case 'delete':
        this.taskUpdateService.delete(task);
        break;
      case 'complete':
        this.taskUpdateService.complete(task);
        break;
      case 'move':
        this.taskUpdateService.move(task);
        break;
      case 'refresh':
        this.taskUpdateService.renew(task);
        break;

      // Add more cases as needed...
      default:
        break;
    }
  }

  mass(task: Task) {
    const dialogRef = this.dialog.open(MassAddPopupComponent, {
      width: '600px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the task in your list or database
        // if (result) {
        //   console.log('Task updated on server:', result);
        //   const taskAction: TaskActions = TaskActions.UPDATED;
        //   this.taskUpdateService.update(result, taskAction);
        // }
        console.log('mass add dialog finished');
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: task, // Pass the task to edit
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the task in your list or database
        if (result) {
          console.log('Task updated on server:', result);
          const taskAction: TaskActions = TaskActions.UPDATED;
          this.taskUpdateService.update(result, taskAction);
        }
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  isSelected() {
    if (!this.task) return false;
    return this.selectedService.isSelected(this.task);
  }

  getIcon(): string {
    if (this.currentAction.action === 'select') {
      return this.isSelected() ? 'check_box' : 'check_box_outline_blank';
    }
    return this.currentAction.icon;
  }
}
