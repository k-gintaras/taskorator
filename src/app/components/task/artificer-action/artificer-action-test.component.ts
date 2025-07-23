import { Component, Input } from '@angular/core';
import { UiTask } from '../../../models/taskModelManager';
import { ArtificerDetails } from '../../artificer/artificer.interface';
import { ArtificerService } from '../../artificer/artificer.service';
import { NgClass, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TaskNodeInfo } from '../../../models/taskTree';
import { TaskActions } from '../../../services/tasks/task-action-tracker.service';
import { TaskEditPopupComponent } from '../task-edit-popup/task-edit-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { TaskUiInteractionService } from '../../../services/tasks/task-list/task-ui-interaction.service';

@Component({
  selector: 'app-artificer-action-test',
  standalone: true,
  imports: [NgClass, MatIcon, NgStyle],
  templateUrl: './artificer-action.component.html',
  styleUrl: './artificer-action.component.scss',
})
export class ArtificerActionComponentTest {
  @Input() task: UiTask | undefined;
  currentAction!: ArtificerDetails;
  @Input() treeNode: TaskNodeInfo | undefined;

  constructor(
    private artificerService: ArtificerService,
    private selectedService: TaskUiInteractionService,
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
    return (
      this.hasIncompleteChildren() &&
      ['delete', 'complete', 'move'].includes(action)
    );
  }

  performAction(): void {
    const task = this.task;
    if (!task) return;
    const action = this.currentAction.action;

    switch (action) {
      case 'promote':
        console.log('this.taskUpdateService.increasePriority(task);');
        break;
      case 'demote':
        console.log('this.taskUpdateService.decreasePriority(task);');

        break;
      case 'edit':
        // display edit popup ?
        this.editTask(task);
        break;
      case 'select':
        this.selectedService.toggleSelection(task.taskId);
        break;
      case 'suggest':
        console.log(' this.gptHelper.suggestTasksForTask(task);');
        break;

      case 'delete':
        console.log('this.taskUpdateService.delete(task);');

        break;
      case 'complete':
        console.log('this.taskUpdateService.complete(task);');
        break;
      case 'move':
        console.log('this.taskUpdateService.move(task);');
        break;
      case 'refresh':
        console.log('this.taskUpdateService.renew(task);');
        break;

      // Add more cases as needed...
      default:
        break;
    }
  }

  editTask(task: UiTask): void {
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
          // this.taskUpdateService.update(result, taskAction);
        }
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  isSelected() {
    if (!this.task) return false;
    return this.task.isSelected;
  }

  getIcon(): string {
    if (this.currentAction.action === 'select') {
      return this.isSelected() ? 'check_box' : 'check_box_outline_blank';
    }
    return this.currentAction.icon;
  }
}
