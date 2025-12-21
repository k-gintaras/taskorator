// src/app/features/nexus/games/priority-duel-game/priority-duel-game.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NexusRound, NexusAnswer } from '../nexus-game.types';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../../services/tree/task-tree-node-tools.service';

@Component({
  selector: 'app-priority-duel-game',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './priority-duel-game.component.html',
  styleUrls: ['./priority-duel-game.component.scss'],
})
export class PriorityDuelGameComponent implements OnInit, OnChanges {
  @Input() round!: NexusRound;
  @Output() answer = new EventEmitter<NexusAnswer>();

  private parentNames = new Map<string, string>();

  constructor(
    private treeService: TreeService,
    private treeTools: TaskTreeNodeToolsService
  ) {}

  ngOnInit(): void {
    this.loadParentNames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['round']) this.loadParentNames();
  }

  onTaskSelected(taskId: string): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      selectedTaskIds: [taskId],
    });
  }

  onEqual(): void {
    // For equal, maybe no change or custom logic, but for now, emit with both
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      selectedTaskIds: this.round.tasks.map(t => t.taskId),
    });
  }

  onSkip(): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      // No selection for skip
    });
  }

  private loadParentNames(): void {
    this.parentNames.clear();
    if (!this.round || !this.round.tasks) return;
    const tree = this.treeService.getLatestTree();
    if (!tree) return;
    for (const t of this.round.tasks) {
      if (!t.overlord) continue;
      const parentNode = this.treeTools.findNodeById(tree.primarch, t.overlord) || tree.abyss.find(n => n.taskId === t.overlord);
      if (parentNode) this.parentNames.set(t.taskId, parentNode.name);
    }
  }

  getParentName(task: any): string {
    return this.parentNames.get(task.taskId) || '';
  }
}