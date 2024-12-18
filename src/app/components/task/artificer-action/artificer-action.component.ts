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

  constructor(
    private taskUpdateService: TaskUpdateService,
    private artificerService: ArtificerService,
    private selectedService: SelectedMultipleService,
    private gptHelper: GptSuggestService
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
        this.taskUpdateService.increasePriority(task);
        break;
      case 'demote':
        this.taskUpdateService.decreasePriority(task);
        break;
      case 'edit':
        // display edit popup ?
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
