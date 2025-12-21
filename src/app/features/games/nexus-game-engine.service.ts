// src/app/features/nexus/games/nexus-game-engine.service.ts
import { Injectable } from '@angular/core';
import { NexusRound, NexusAnswer, TaskActionPatch, NexusGame } from './nexus-game.types';
import { priorityDuelGame, favoritePickGame } from './built-in-games';
import { UiTask } from '../../models/taskModelManager';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../services/tree/task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class NexusGameEngineService {
  private availableGames: NexusGame[] = [priorityDuelGame, favoritePickGame];
  private currentTasks: UiTask[] = [];

  constructor(
    private treeService: TreeService,
    private treeTools: TaskTreeNodeToolsService
  ) {}

  setTasks(tasks: UiTask[]): void {
    this.currentTasks = tasks;
  }

  getNextRandomRound(): NexusRound | null {
    if (this.currentTasks.length === 0) return null;

    const selectedGame = this.selectGameByWeight();
    // Special-case favorite-pick to prefer "big" tasks from the tree
    if (selectedGame.id === 'favorite-pick') {
      const fav = this.generateFavoriteRound(this.currentTasks);
      if (fav) return fav;
      // fallback to default generator
    }

    return selectedGame.generateRound(this.currentTasks);
  }

  private generateFavoriteRound(allTasks: UiTask[]): NexusRound | null {
    // Prefer tasks that have many descendants or deep nesting
    const tree = this.treeService.getLatestTree();
    const candidates: UiTask[] = [];

    if (tree) {
      const nodes = this.treeTools.getFlattened(tree);
      // Find candidate node IDs where descendant count >= threshold
      const bigNodes = nodes.filter((n) => this.treeTools.countDescendants(n) >= 4);
      // Map to UiTask entries, ensure stage/status checks
      const bigTasks = bigNodes
        .map((n) => allTasks.find((t) => t.taskId === n.taskId))
        .filter((t): t is UiTask => !!t && t.stage === 'todo' && t.status === 'active');

      // Shuffle and pick up to 4 big tasks
      const shuffledBig = [...bigTasks].sort(() => 0.5 - Math.random()).slice(0, 4);
      candidates.push(...shuffledBig);
    }

    // Always include one random task (may be big or small) to keep variety
    const otherPool = allTasks.filter((t) => t.stage === 'todo' && t.status === 'active' && !candidates.find(c => c.taskId === t.taskId));
    if (otherPool.length === 0 && candidates.length === 0) return null;

    const randomPick = otherPool.length ? otherPool[Math.floor(Math.random() * otherPool.length)] : null;
    if (randomPick) candidates.push(randomPick);

    // If we don't have enough candidates, fill with randoms
    while (candidates.length < 5 && otherPool.length > 0) {
      const pick = otherPool[Math.floor(Math.random() * otherPool.length)];
      if (!candidates.find(c => c.taskId === pick.taskId)) candidates.push(pick);
      if (candidates.length >= otherPool.length) break; // avoid infinite loop
    }

    if (!candidates.length) return null;

    // Limit to 5
    const final = candidates.slice(0, 5);

    return {
      id: `round_${Date.now()}_${Math.random()}`,
      gameId: 'favorite-pick',
      question: 'Which of these is your favorite right now?',
      tasks: final,
      mode: 'pick1',
    };
  }

  submitAnswer(answer: NexusAnswer): TaskActionPatch[] {
    const game = this.availableGames.find(g => g.id === answer.gameId);
    if (!game) return [];

    const round = this.getRoundById(answer.roundId);
    if (!round) return [];

    return game.applyAnswer(round, answer);
  }

  /**
   * Apply an answer to a known round instance. This is useful when the
   * caller already has the round object (for example a host component that
   * generated it) and wants the engine to calculate resulting patches.
   */
  applyAnswerToRound(round: NexusRound, answer: NexusAnswer): TaskActionPatch[] {
    const game = this.availableGames.find((g) => g.id === answer.gameId);
    if (!game) return [];
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