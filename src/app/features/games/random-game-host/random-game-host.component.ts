// src/app/features/nexus/games/random-game-host/random-game-host.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexusGameEngineService } from '../nexus-game-engine.service';
import { NexusGameFacadeService } from '../nexus-game-facade.service';
import { NexusRound, NexusAnswer } from '../nexus-game.types';
import { UiTask } from '../../../models/taskModelManager';
import { PriorityDuelGameComponent } from '../priority-duel-game/priority-duel-game.component';
import { FavoritePickGameComponent } from '../favorite-pick-game/favorite-pick-game.component';

@Component({
  selector: 'app-random-game-host',
  standalone: true,
  imports: [CommonModule, PriorityDuelGameComponent, FavoritePickGameComponent],
  templateUrl: './random-game-host.component.html',
  styleUrls: ['./random-game-host.component.scss'],
})
export class RandomGameHostComponent implements OnInit, OnChanges {
  @Input() tasks: any[] = [];
  currentRound: NexusRound | null = null;

  constructor(private gameEngine: NexusGameEngineService, private facade: NexusGameFacadeService) {}

  ngOnInit(): void {
    // initial wiring (may be empty)
    this.facade.setTasks(this.tasks);
    this.loadNextRound();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks']) {
      const next = changes['tasks'].currentValue as UiTask[];
      this.facade.setTasks(next || []);
      // If new tasks became available, immediately load a fresh round
      if (next && next.length > 0) {
        this.loadNextRound();
      }
    }
  }

  async onAnswer(answer: NexusAnswer): Promise<void> {
    if (!this.currentRound) return;
    await this.facade.submitAnswer(this.currentRound, answer);
    this.loadNextRound();
  }

  private loadNextRound(): void {
    this.currentRound = this.gameEngine.getNextRandomRound();
  }
}