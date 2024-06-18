import { Injectable } from '@angular/core';
import { TaskTreeNode, TaskTree } from '../../../models/taskTree';
import { SettingsService } from '../../../services/core/settings.service';
import { TreeService } from '../../../services/core/tree.service';
import { TaskSettings } from '../../../models/settings';

@Injectable({
  providedIn: 'root',
})
export class FavoriteTaskService {
  settings: TaskSettings | undefined;
  tree: TaskTree | undefined;

  constructor(
    private settingsService: SettingsService,
    private treeService: TreeService
  ) {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) this.settings = s;
    });

    this.treeService.getTree().subscribe((t: TaskTree | null) => {
      if (t) this.tree = t;
    });
  }

  getFavoriteTasks(): TaskTreeNode[] | undefined {
    if (!this.settings || !this.tree) return undefined;

    return this.settings.favoriteTaskIds
      .map((id) => this.findTaskInTree(id, this.tree!.root))
      .filter((task): task is TaskTreeNode => task !== undefined);
  }

  private findTaskInTree(
    id: string,
    node: TaskTreeNode
  ): TaskTreeNode | undefined {
    if (node.taskId === id) {
      return node;
    }
    for (let child of node.children) {
      let found = this.findTaskInTree(id, child);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  removeFavoriteTask(taskId: string): void {
    if (!this.settings) return;

    const updatedSettings = {
      ...this.settings,
      favoriteTaskIds: this.settings.favoriteTaskIds.filter(
        (id) => id !== taskId
      ),
    };

    this.settingsService.updateSettings(updatedSettings);
  }

  toggleFavoriteTask(taskId: string): void {
    if (!this.settings) return;

    const updatedSettings = {
      ...this.settings,
    };

    if (this.settings.favoriteTaskIds.includes(taskId)) {
      updatedSettings.favoriteTaskIds = this.settings.favoriteTaskIds.filter(
        (id) => id !== taskId
      );
    } else {
      updatedSettings.favoriteTaskIds.push(taskId);
    }

    this.settingsService.updateSettings(updatedSettings);
  }
}
