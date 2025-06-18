import { Component } from '@angular/core';
import { ArtificerDetails } from './artificer.interface';
import { ArtificerService } from './artificer.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
/**
 * what we can do with each task
 * delete
 * complete
 * add selected into (crush)
 * split
 * promote
 * demote
 * search similar?
 * edit
 */
@Component({
  selector: 'app-artificer',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, MatIcon],
  templateUrl: './artificer.component.html',
  styleUrl: './artificer.component.scss',
})
export class ArtificerComponent {
  actions: ArtificerDetails[];
  currentAction!: ArtificerDetails;
  isHorizontal = true;

  constructor(private artificerService: ArtificerService) {
    this.actions = this.artificerService.getActions();
    this.artificerService.currentAction$.subscribe((action) => {
      this.currentAction = action;
    });
  }

  selectAction(action: ArtificerDetails): void {
    this.artificerService.setCurrentAction(action);
  }

  getActionClasses(action: ArtificerDetails) {
    return {
      selected: action === this.currentAction,
      [action.colorClass]: true,
    };
  }

  getActionClass(action: ArtificerDetails) {
    const selected = action === this.currentAction ? ' selected' : '';
    const classs = action.colorClass ? ` ${action.colorClass}` : '';
    return selected + ' ' + classs;
  }
}
