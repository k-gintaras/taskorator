// src/app/features/nexus/games/favorite-pick-game/favorite-pick-game.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../../services/tree/task-tree-node-tools.service';
import { NexusRound, NexusAnswer } from '../nexus-game.types';

@Component({
  selector: 'app-favorite-pick-game',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './favorite-pick-game.component.html',
  styleUrls: ['./favorite-pick-game.component.scss'],
})
export class FavoritePickGameComponent implements OnInit, OnChanges {
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

  onSkip(): void {
    this.answer.emit({
      roundId: this.round.id,
      gameId: this.round.gameId,
      // no selectedTaskIds indicates a skip
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