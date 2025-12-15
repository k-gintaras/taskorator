// src/app/features/nexus/games/favorite-pick-game/favorite-pick-game.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexusRound, NexusAnswer } from '../nexus-game.types';

@Component({
  selector: 'app-favorite-pick-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-pick-game.component.html',
  styleUrls: ['./favorite-pick-game.component.scss'],
})
export class FavoritePickGameComponent {
  @Input() round!: NexusRound;
  @Output() answer = new EventEmitter<NexusAnswer>();

  onTaskSelected(taskId: string): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      selectedTaskIds: [taskId],
    });
  }
}