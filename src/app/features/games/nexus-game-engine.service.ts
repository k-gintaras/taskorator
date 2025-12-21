// src/app/features/nexus/games/nexus-game-engine.service.ts
import { Injectable } from '@angular/core';
import { NexusRound, NexusAnswer, TaskActionPatch, NexusGame } from './nexus-game.types';
import { priorityDuelGame, favoritePickGame } from './built-in-games';
import { TaskTreeNode } from '../../models/taskTree';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../services/tree/task-tree-node-tools.service';
import { TreeNodeService } from '../../services/tree/tree-node.service';

@Injectable({
  providedIn: 'root',
})
export class NexusGameEngineService {
  private availableGames: NexusGame[] = [priorityDuelGame, favoritePickGame];
  // We only need minimal task shape for game logic: { taskId, name, overlord, stage?, status? }
  private currentTasks: any[] = [];

  constructor(
    private treeService: TreeService,
    private treeTools: TaskTreeNodeToolsService,
    private treeNodeService: TreeNodeService
  ) {}

  setTasks(tasks: any[]): void {
    if (!tasks || !tasks.length) {
      this.currentTasks = [];
      return;
    }

    const first = tasks[0];
    if (first && Array.isArray(first.children)) {
      // Convert tree nodes to minimal task objects
      this.currentTasks = (tasks as TaskTreeNode[])
        .map((n) => ({
          taskId: n.taskId,
          name: n.name,
          overlord: n.overlord,
          stage: n.stage,
          status: 'active',
        }))
        .filter((t) => t.taskId !== undefined && t.taskId !== null);
    } else {
      // Normalize incoming tasks to minimal shape
      this.currentTasks = (tasks as any[]).map((t) => ({
        taskId: t.taskId,
        name: t.name,
        overlord: t.overlord,
        stage: t.stage,
        status: t.status || 'active',
      }));
    }
  }

  getNextRandomRound(): NexusRound | null {
    if (this.currentTasks.length === 0) return null;

    const selectedGame = this.selectGameByWeight();
    // Special-case favorite-pick to prefer "big" tasks from the tree
    if (selectedGame.id === 'favorite-pick') {
      const fav = this.generateFavoriteRound(this.currentTasks);
      if (fav) return fav;
    }

    // Special-case priority-duel to choose two children of the same parent
    if (selectedGame.id === 'priority-duel') {
      const pr = this.generatePriorityRound(this.currentTasks);
      if (pr) return pr;
    }

    return selectedGame.generateRound(this.currentTasks);
  }

  private generateFavoriteRound(allTasks: any[]): NexusRound | null {
    // Prefer tasks that live under "big" parents (many descendants / children)
    const tree = this.treeService.getLatestTree();
    const candidates: any[] = [];

    if (tree) {
      const bigParents = this.treeNodeService.getBigParents(tree);

      // Rank parents by descendent count
      const ranked = bigParents
        .map((n) => ({ node: n, desc: this.treeTools.countDescendants(n) }))
        .sort((a, b) => b.desc - a.desc);

      const pool = ranked.slice(0, Math.min(10, ranked.length));
      const chosenParents = new Set<string>();

      for (let i = 0; i < Math.min(4, pool.length); i++) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!pick || chosenParents.has(pick.node.taskId)) continue;
        chosenParents.add(pick.node.taskId);

        const subtree = this.treeTools.flattenTree(pick.node);
        const descendantIds = new Set(subtree.map((n) => n.taskId));
        const childCandidates = allTasks.filter(
          (t) => descendantIds.has(t.taskId) && t.stage === 'todo' && t.status === 'active'
        );

        if (!childCandidates.length) continue;

        const selectedChild = childCandidates[Math.floor(Math.random() * childCandidates.length)];
        if (!candidates.find((c) => c.taskId === selectedChild.taskId)) {
          candidates.push(selectedChild);
        }
      }
    }

    // Add a random active todo to keep variety
    const otherPool = allTasks.filter((t) => t.stage === 'todo' && t.status === 'active' && !candidates.find((c) => c.taskId === t.taskId));
    if (otherPool.length === 0 && candidates.length === 0) return null;

    if (otherPool.length) {
      const randomPick = otherPool[Math.floor(Math.random() * otherPool.length)];
      if (randomPick) candidates.push(randomPick);
    }

    while (candidates.length < 5 && otherPool.length > 0) {
      const pick = otherPool[Math.floor(Math.random() * otherPool.length)];
      if (!candidates.find((c) => c.taskId === pick.taskId)) candidates.push(pick);
      if (candidates.length >= otherPool.length) break;
    }

    if (!candidates.length) return null;

    return {
      id: `round_${Date.now()}_${Math.random()}`,
      gameId: 'favorite-pick',
      question: 'Which of these is your favorite right now?',
      tasks: candidates.slice(0, 5),
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

  private generatePriorityRound(allTasks: any[]): NexusRound | null {
    const tree = this.treeService.getLatestTree();
    if (!tree) return null;

    // Use TreeNodeService to quickly find a parent with >=2 children
    const parent = this.treeNodeService.getRandomParentWithMinChildren(tree, 2);
    if (!parent) return null;

    const childIds = parent.children.map((c) => c.taskId);
    const eligibleChildren = allTasks.filter(
      (t) => childIds.includes(t.taskId) && t.stage === 'todo' && t.status === 'active'
    );

    if (eligibleChildren.length < 2) return null;

    const shuffled = [...eligibleChildren].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    return {
      id: `round_${Date.now()}_${Math.random()}`,
      gameId: 'priority-duel',
      question: `Within "${parent.name}", which task has higher priority?`,
      tasks: selected,
      mode: 'pick1',
    };
  }

  private getRoundById(roundId: string): NexusRound | null {
    // For now, since rounds are generated on the fly, we can't retrieve by ID.
    // In a real implementation, we'd store rounds or regenerate based on ID.
    // Placeholder: return null
    return null;
  }
}