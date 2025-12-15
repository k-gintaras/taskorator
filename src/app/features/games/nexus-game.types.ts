// src/app/features/nexus/games/nexus-game.types.ts

import { TaskoratorTask, UiTask } from "../../models/taskModelManager";


export interface NexusRound {
  id: string;            // unique round id
  gameId: string;        // e.g. 'priority-duel', 'favorite-pick'
  question: string;
  tasks: UiTask[];       // tasks involved in this round
  mode: 'pick1' | 'pick2' | 'eliminate1' | 'classify' | 'tag' | 'bool';
  options?: string[];    // extra options for some modes (tags, types, labels)
}

export type NexusAnswer = {
  roundId: string;
  gameId: string;
  selectedTaskIds?: string[];
  selectedOption?: string;
  extraData?: any;
};

export interface TaskActionPatch {
  taskId: string;
  changes: Partial<TaskoratorTask>;
  reason: string;        // e.g. 'priorityIncreased', 'tagAdded'
}

export interface NexusGame {
  id: string;
  label: string;
  weight: number; // used for random selection
  generateRound(allTasks: UiTask[]): NexusRound | null;
  applyAnswer(round: NexusRound, answer: NexusAnswer): TaskActionPatch[];
}