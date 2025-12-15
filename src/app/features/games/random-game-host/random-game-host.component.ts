// src/app/features/nexus/games/random-game-host/random-game-host.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexusGameEngineService } from '../nexus-game-engine.service';
import { NexusRound, NexusAnswer, UiTask } from '../nexus-game.types';
import { PriorityDuelGameComponent } from '../priority-duel-game/priority-duel-game.component';
import { FavoritePickGameComponent } from '../favorite-pick-game/favorite-pick-game.component';

@Component({
  selector: 'app-random-game-host',
  standalone: true,
  imports: [CommonModule, PriorityDuelGameComponent, FavoritePickGameComponent],
  templateUrl: './random-game-host.component.html',
  styleUrls: ['./random-game-host.component.scss'],
})
export class RandomGameHostComponent implements OnInit {
  @Input() tasks: UiTask[] = [];
  currentRound: NexusRound | null = null;

  constructor(private gameEngine: NexusGameEngineService) {}

  ngOnInit(): void {
    this.gameEngine.setTasks(this.tasks);
    this.loadNextRound();
  }

  onAnswer(answer: NexusAnswer): void {
    const patches = this.gameEngine.submitAnswer(answer);
    console.log('Patches:', patches);
    // TODO: Apply patches to tasks or persist changes
    this.loadNextRound();
  }

  private loadNextRound(): void {
    this.currentRound = this.gameEngine.getNextRandomRound();
  }
}