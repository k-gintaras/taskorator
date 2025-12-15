// src/app/features/nexus/games/priority-duel-game/priority-duel-game.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexusRound, NexusAnswer } from '../nexus-game.types';

@Component({
  selector: 'app-priority-duel-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-duel-game.component.html',
  styleUrls: ['./priority-duel-game.component.scss'],
})
export class PriorityDuelGameComponent {
  @Input() round!: NexusRound;
  @Output() answer = new EventEmitter<NexusAnswer>();

  onTaskSelected(taskId: string): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      selectedTaskIds: [taskId],
    });
  }

  onEqual(): void {
    // For equal, maybe no change or custom logic, but for now, emit with both
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      selectedTaskIds: this.round.tasks.map(t => t.taskId),
    });
  }

  onSkip(): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      // No selection for skip
    });
  }
}