import { Injectable } from '@angular/core';
import { NexusGameEngineService } from './nexus-game-engine.service';
import { NexusRound, NexusAnswer, TaskActionPatch } from './nexus-game.types';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskBatchService } from '../../services/sync-api-cache/task-batch.service';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskActions } from '../../services/tasks/task-action-tracker.service';
import { TaskSettingsTasksService } from '../../services/tasks/task-settings-tasks.service';

@Injectable({ providedIn: 'root' })
export class NexusGameFacadeService {
  constructor(
    private engine: NexusGameEngineService,
    private taskService: TaskService,
    private taskBatch: TaskBatchService,
    private taskUpdateService: TaskUpdateService
    , private settingsTasks: TaskSettingsTasksService
  ) {}

  setTasks(tasks: any[]) {
    this.engine.setTasks(tasks as any);
  }

  getNextRound(): NexusRound | null {
    return this.engine.getNextRandomRound();
  }

  async submitAnswer(round: NexusRound, answer: NexusAnswer): Promise<void> {
    // Handle certain games with bespoke logic first
    try {
      if (round.gameId === 'priority-duel') {
        // Increment elo for the selected/winner task
        const winnerId = answer.selectedTaskIds && answer.selectedTaskIds[0];
        if (!winnerId) return;
        const uiTask = await this.taskService.getTaskById(winnerId);
        if (!uiTask) return;

        const taskObj: TaskoratorTask = { ...uiTask } as TaskoratorTask;
        taskObj.elo = (taskObj.elo || 0) + 1;
        await this.taskUpdateService.update(taskObj, TaskActions.UPDATED, `game:priority-duel`);
        return;
      }

      if (round.gameId === 'favorite-pick') {
        // Mark selected task as favorite in settings
        const selectedId = answer.selectedTaskIds && answer.selectedTaskIds[0];
        if (!selectedId) return;
        const uiTask = await this.taskService.getTaskById(selectedId);
        if (!uiTask) return;

        await this.settingsTasks.addTaskToFavorites(uiTask as TaskoratorTask);
        return;
      }

      // Default: use engine patches to prepare task updates
      const patches: TaskActionPatch[] = this.engine.applyAnswerToRound(round, answer);
      if (!patches || patches.length === 0) return;

      for (const p of patches) {
        try {
          const uiTask = await this.taskService.getTaskById(p.taskId);
          if (!uiTask) continue;
          const taskObj: TaskoratorTask = { ...uiTask } as TaskoratorTask;
          Object.assign(taskObj, p.changes);
          await this.taskUpdateService.update(taskObj, TaskActions.UPDATED, `game:${round.gameId}`);
        } catch (err) {
          console.error('Failed to prepare/apply task patch', p, err);
        }
      }
    } catch (err) {
      console.error('Failed to apply game patches', err);
    }
  }
}
