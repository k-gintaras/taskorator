import { Injectable } from '@angular/core';
import { NexusGameEngineService } from './nexus-game-engine.service';
import { NexusRound, NexusAnswer, TaskActionPatch } from './nexus-game.types';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskBatchService } from '../../services/sync-api-cache/task-batch.service';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskActions } from '../../services/tasks/task-action-tracker.service';

@Injectable({ providedIn: 'root' })
export class NexusGameFacadeService {
  constructor(
    private engine: NexusGameEngineService,
    private taskService: TaskService,
    private taskBatch: TaskBatchService
  ) {}

  setTasks(tasks: any[]) {
    this.engine.setTasks(tasks as any);
  }

  getNextRound(): NexusRound | null {
    return this.engine.getNextRandomRound();
  }

  async submitAnswer(round: NexusRound, answer: NexusAnswer): Promise<void> {
    const patches: TaskActionPatch[] = this.engine.applyAnswerToRound(round, answer);
    if (!patches || patches.length === 0) return;

    // Build full task objects, apply partial changes and submit as a batch
    const tasksToUpdate: TaskoratorTask[] = [];
    for (const p of patches) {
      try {
        const uiTask = await this.taskService.getTaskById(p.taskId);
        if (!uiTask) continue;
        const taskObj: TaskoratorTask = { ...uiTask } as TaskoratorTask;
        Object.assign(taskObj, p.changes);
        tasksToUpdate.push(taskObj);
      } catch (err) {
        console.error('Failed to prepare task for patch', p, err);
      }
    }

    if (tasksToUpdate.length === 0) return;

    // Use a generic UPDATE action and include game id as subAction
    try {
      await this.taskBatch.updateTaskBatch(tasksToUpdate, TaskActions.UPDATED, `game:${round.gameId}`);
    } catch (err) {
      console.error('Failed to apply game patches', err);
    }
  }
}
