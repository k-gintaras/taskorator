import { Injectable } from '@angular/core';
import { TaskoratorTask } from '../../models/taskModelManager';

@Injectable({ providedIn: 'root' })
export class TaskPriorityService {
  // Fallback + bootstrap from existing data
  getElo(task: TaskoratorTask): number {
    if (typeof task.elo === 'number') return task.elo;

    const base = (task.priority - 5) * 100; // 1–10 -> -400..+400
    const ageDays = (Date.now() - task.timeCreated) / 86_400_000;

    let score = base - ageDays * 2;

    if (task.stage === 'archived' || task.status === 'inactive') {
      score -= 200;
    }

    return score;
  }

  eloToUiPriority(score: number, min = -800, max = 800): number {
    if (max === min) return 5;
    const norm = (score - min) / (max - min); // 0..1
    const bucket = Math.round(norm * 9) + 1;
    return Math.min(10, Math.max(1, bucket));
  }

  // You’ll call this from Nexus when doing pairwise updates:
  applyComparison(winner: TaskoratorTask, loser: TaskoratorTask): {
    winnerElo: number;
    loserElo: number;
  } {
    const k = 24;
    const wScore = this.getElo(winner);
    const lScore = this.getElo(loser);
    const diff = lScore - wScore;
    const expectedWinner = 1 / (1 + Math.pow(10, diff / 400));
    const change = k * (1 - expectedWinner);

    return {
      winnerElo: wScore + change,
      loserElo: lScore - change,
    };
  }
}