import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtificerDetails } from './artificer.interface';
import { ArtificerService } from './artificer.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  imports: [CommonModule, MatIcon, MatTooltipModule],
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

  // Helper to build a space-separated string of utility classes
  getActionClass(action: ArtificerDetails): string {
    const base = action.colorClass;
    const selected = action === this.currentAction ? ' selected' : '';
    return `${base}${selected}`;
  }

}
