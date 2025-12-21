import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RandomGameHostComponent } from '../../../games/random-game-host/random-game-host.component';
import { TaskCacheService } from '../../../../services/cache/task-cache.service';
import { ROOT_TASK_ID } from '../../../../models/taskModelManager';
import { TaskListService } from '../../../../services/sync-api-cache/task-list.service';
import { TreeService } from '../../../../services/sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../../../../services/tree/task-tree-node-tools.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-nexus-games',
  standalone: true,
  imports: [CommonModule, MatIconModule, RandomGameHostComponent],
  template: `
    <div class="theme-card p-6 mb-6">
      <div class="flex items-center gap-2 mb-6">
        <mat-icon style="color: var(--purple-primary);">sports_esports</mat-icon>
        <h2 class="theme-text-primary text-lg font-medium">Task Games</h2>
      </div>
      <app-random-game-host [tasks]="tasks"></app-random-game-host>
    </div>
  `,
  styles: [],
})
export class NexusGamesComponent implements OnInit {
  tasks = [] as any[];
  constructor(
    private cache: TaskCacheService,
    private tree: TreeService,
    private taskList: TaskListService,
    private treeTools: TaskTreeNodeToolsService
  ) {}

  ngOnInit(): void {
    // Wait for the tree to be loaded so groups and IDs are available in caches.
    this.tree
      .getTree()
      .pipe(filter((t) => !!t), take(1))
      .subscribe(async () => {
        // Build tasks list from the authoritative tree so games see internal nodes
        const latest = this.tree.getLatestTree();
        if (latest) {
          const primarchNodes = this.treeTools.getFlattened(latest) || [];
          const abyssNodes = latest.abyss || [];
          const allNodes = [...primarchNodes, ...abyssNodes];

          const nodes = allNodes.filter(
            (n) => n.taskId !== ROOT_TASK_ID && n.stage === 'todo'
          );

          if (nodes.length > 0) {
            this.tasks = nodes; // pass raw tree nodes to the games host
            return;
          }

        }

        // Fallback: try to fetch latest updated tasks to populate caches if empty
        try {
          const fetched = await this.taskList.getLatestUpdatedTasks();
          if (fetched && fetched.length > 0) {
            this.tasks = fetched.filter((t) =>
              t.taskId !== ROOT_TASK_ID && t.stage === 'todo' && t.status === 'active'
            );
            return;
          }
        } catch (e) {
          // ignore - fallback to cache
        }

        // final fallback to cache
        const allTasks = this.cache.getAllTasks();
        if (allTasks && allTasks.length > 0) {
          this.tasks = allTasks.filter((t) =>
            t.taskId !== ROOT_TASK_ID && t.stage === 'todo' && t.status === 'active'
          );
        }
      });
  }
}
