import { Component, Input } from '@angular/core';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';
import { ArtificerDetails } from '../../artificer/artificer.interface';
import { ArtificerService } from '../../artificer/artificer.service';
import { NgClass, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TaskNodeInfo } from '../../../models/taskTree';
import { TaskUiInteractionService } from '../../../services/tasks/task-list/task-ui-interaction.service';
import { GptSuggestService } from '../../../features/gpt/services/gpt-suggest.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskEditPopupComponent } from '../task-edit-popup/task-edit-popup.component';
import { TaskActions } from '../../../services/tasks/task-action-tracker.service';
import { MassAddPopupComponent } from '../../mass-add-popup/mass-add-popup.component';
import { TaskService } from '../../../services/sync-api-cache/task.service';

@Component({
  selector: 'app-artificer-action',
  standalone: true,
  imports: [NgClass, MatIcon, NgStyle],
  templateUrl: './artificer-action.component.html',
  styleUrls: ['./artificer-action.component.scss'],
})
export class ArtificerActionComponent {
  @Input() task?: TaskoratorTask;
  currentAction!: ArtificerDetails;
  @Input() treeNode: TaskNodeInfo | null = null;
  @Input() protectTaskFromDelete = true;

  constructor(
    private taskUpdateService: TaskUpdateService,
    private artificerService: ArtificerService,
    private taskUiInteractionService: TaskUiInteractionService,
    private taskService: TaskService,
    private gptHelper: GptSuggestService,
    private dialog: MatDialog
  ) {
    this.artificerService.currentAction$.subscribe((action) => {
      this.currentAction = action;
    });
  }

  getColor() {
    if (!this.treeNode) return;
    const isRepeatingTask =
      this.task?.repeat !== 'never' && this.task?.repeat !== 'once';
    if (isRepeatingTask) return 'complete-icon-color-checklist';

    if (this.treeNode.childrenCount > 0) {
      if (this.treeNode.completedChildrenCount < this.treeNode.childrenCount) {
        return 'complete-icon-color-parent';
      }
    } else {
      return 'complete-icon-color-child';
    }

    return 'complete-icon-color-child';
  }

  hasIncompleteChildren() {
    if (!this.treeNode) return false;
    if (this.treeNode.childrenCount < 1) return false;
    return this.treeNode.completedChildrenCount < this.treeNode.childrenCount;
  }

  getButtonStyle() {
    return this.isActionRestricted(this.currentAction.action)
      ? { visibility: 'hidden', pointerEvents: 'none' }
      : {};
  }

  isActionRestricted(action: string): boolean {
    if (!this.protectTaskFromDelete) return false;
    return (
      this.hasIncompleteChildren() && ['delete', 'complete'].includes(action)
    );
  }

  performAction(): void {
    if (!this.task) return;
    const action = this.currentAction.action;

    switch (action) {
      case 'moveToParent':
        this.moveToParent(this.task);
        break;
      case 'promote':
        this.taskUpdateService.increasePriority(this.task);
        break;
      case 'demote':
        this.taskUpdateService.decreasePriority(this.task);
        break;
      case 'edit':
        this.editTask(this.task);
        break;
      case 'mass':
        this.mass(this.task);
        break;
      case 'select':
        this.taskUiInteractionService.toggleSelection(this.task.taskId);
        break;
      case 'suggest':
        this.gptHelper.suggestTasksForTask(this.task);
        break;
      case 'delete':
        this.taskUpdateService.delete(this.task);
        break;
      case 'complete':
        this.taskUpdateService.complete(this.task);
        break;
      case 'move':
        this.taskUpdateService.move(this.task);
        break;
      case 'refresh':
        this.taskUpdateService.renew(this.task);
        break;
      default:
        break;
    }
  }

  async moveToParent(task: TaskoratorTask): Promise<void> {
    if (!task.overlord) {
      console.warn('Task has no parent, cannot move to parent level.');
      return;
    }

    const parentTask = await this.taskService.getSuperOverlord(task.overlord);
    if (!parentTask) {
      console.warn('Parent task not found, cannot move to parent level.');
      return;
    }

    task.overlord = parentTask.overlord;
    await this.taskUpdateService.update(task, TaskActions.MOVED);
  }

  mass(task: TaskoratorTask) {
    const dialogRef = this.dialog.open(MassAddPopupComponent, {
      width: '600px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('mass add dialog finished');
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  editTask(task: TaskoratorTask): void {
    const dialogRef = this.dialog.open(TaskEditPopupComponent, {
      width: '600px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Task updated on server:', result);
        this.taskUpdateService.update(result, TaskActions.UPDATED);
      } else {
        console.log('task not updated or so dialog says...');
      }
    });
  }

  isSelected(): boolean {
    if (!this.task) return false;
    return this.taskUiInteractionService
      .getSelectedTaskIds()
      .includes(this.task.taskId);
  }

  getIcon(): string {
    if (this.currentAction.action === 'select') {
      return this.isSelected() ? 'check_box' : 'check_box_outline_blank';
    }
    return this.currentAction.icon;
  }
}
