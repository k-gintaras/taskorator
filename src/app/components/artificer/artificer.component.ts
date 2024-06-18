import { Component } from '@angular/core';
import { ArtificerDetails } from './artificer.interface';
import { ArtificerService } from './artificer.service';
import { NgClass, NgFor } from '@angular/common';
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
  imports: [NgFor, NgClass, MatIcon],
  templateUrl: './artificer.component.html',
  styleUrl: './artificer.component.scss',
})
export class ArtificerComponent {
  actions: ArtificerDetails[];
  currentAction!: ArtificerDetails;

  constructor(private artificerService: ArtificerService) {
    this.actions = this.artificerService.getActions();
    this.artificerService.currentAction$.subscribe((action) => {
      this.currentAction = action;
    });
  }

  selectAction(action: ArtificerDetails): void {
    this.artificerService.setCurrentAction(action);
  }
}
