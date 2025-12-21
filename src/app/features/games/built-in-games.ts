// src/app/features/nexus/games/built-in-games.ts
import { UiTask } from '../../models/taskModelManager';
import { NexusRound, NexusAnswer, TaskActionPatch, NexusGame } from './nexus-game.types';

export const priorityDuelGame: NexusGame = {
  id: 'priority-duel',
  label: 'Priority Duel',
  weight: 1,
  generateRound(allTasks: UiTask[]): NexusRound | null {
    if (allTasks.length < 2) return null;

    const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, 2);

    return {
      id: `round_${Date.now()}_${Math.random()}`,
      gameId: 'priority-duel',
      question: 'Which task has higher priority?',
      tasks: selectedTasks,
      mode: 'pick1',
    };
  },
  applyAnswer(round: NexusRound, answer: NexusAnswer): TaskActionPatch[] {
    const patches: TaskActionPatch[] = [];
    if (!answer.selectedTaskIds || answer.selectedTaskIds.length !== 1) return patches;

    const winnerId = answer.selectedTaskIds[0];
    const loserId = round.tasks.find(t => t.taskId !== winnerId)?.taskId;

    if (winnerId) {
      const winnerTask = round.tasks.find(t => t.taskId === winnerId);
      if (winnerTask) {
        patches.push({
          taskId: winnerId,
          changes: { priority: Math.min(winnerTask.priority + 1, 10) },
          reason: 'priorityIncreased',
        });
      }
    }

    if (loserId) {
      const loserTask = round.tasks.find(t => t.taskId === loserId);
      if (loserTask) {
        patches.push({
          taskId: loserId,
          changes: { priority: Math.max(loserTask.priority - 1, 1) },
          reason: 'priorityDecreased',
        });
      }
    }

    return patches;
  },
};

export const favoritePickGame: NexusGame = {
  id: 'favorite-pick',
  label: 'Favorite Pick',
  weight: 1,
  generateRound(allTasks: UiTask[]): NexusRound | null {
    if (allTasks.length === 0) return null;

    const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, Math.min(5, allTasks.length));

    return {
      id: `round_${Date.now()}_${Math.random()}`,
      gameId: 'favorite-pick',
      question: 'Which of these is your favorite right now?',
      tasks: selectedTasks,
      mode: 'pick1',
    };
  },
  applyAnswer(round: NexusRound, answer: NexusAnswer): TaskActionPatch[] {
    const patches: TaskActionPatch[] = [];
    if (!answer.selectedTaskIds || answer.selectedTaskIds.length !== 1) return patches;

    const winnerId = answer.selectedTaskIds[0];

    // Increase winner priority
    const winnerTask = round.tasks.find(t => t.taskId === winnerId);
    if (winnerTask) {
      patches.push({
        taskId: winnerId,
        changes: { priority: Math.min(winnerTask.priority + 1, 10) },
        reason: 'priorityIncreased',
      });
    }

    // Slightly decrease others
    round.tasks.forEach(task => {
      if (task.taskId !== winnerId) {
        patches.push({
          taskId: task.taskId,
          changes: { priority: Math.max(task.priority - 1, 1) },
          reason: 'priorityDecreased',
        });
      }
    });

    return patches;
  },
};