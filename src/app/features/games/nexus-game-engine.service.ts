// src/app/features/nexus/games/nexus-game-engine.service.ts
import { Injectable } from '@angular/core';
import { NexusRound, NexusAnswer, TaskActionPatch, NexusGame } from './nexus-game.types';
import { priorityDuelGame, favoritePickGame } from './built-in-games';
import { UiTask } from '../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class NexusGameEngineService {
  private availableGames: NexusGame[] = [priorityDuelGame, favoritePickGame];
  private currentTasks: UiTask[] = [];

  setTasks(tasks: UiTask[]): void {
    this.currentTasks = tasks;
  }

  getNextRandomRound(): NexusRound | null {
    if (this.currentTasks.length === 0) return null;

    const selectedGame = this.selectGameByWeight();
    return selectedGame.generateRound(this.currentTasks);
  }

  submitAnswer(answer: NexusAnswer): TaskActionPatch[] {
    const game = this.availableGames.find(g => g.id === answer.gameId);
    if (!game) return [];

    const round = this.getRoundById(answer.roundId);
    if (!round) return [];

    return game.applyAnswer(round, answer);
  }

  private selectGameByWeight(): NexusGame {
    const totalWeight = this.availableGames.reduce((sum, game) => sum + game.weight, 0);
    let random = Math.random() * totalWeight;

    for (const game of this.availableGames) {
      random -= game.weight;
      if (random <= 0) {
        return game;
      }
    }

    // Fallback to first game
    return this.availableGames[0];
  }

  private getRoundById(roundId: string): NexusRound | null {
    // For now, since rounds are generated on the fly, we can't retrieve by ID.
    // In a real implementation, we'd store rounds or regenerate based on ID.
    // Placeholder: return null
    return null;
  }
}