import { Injectable } from '@angular/core';
import { TaskSettings } from '../../../../../models/settings';
import { TaskTree, TaskTreeNode } from '../../../../../models/taskTree';
import { SettingsService } from '../../../../../services/core/settings.service';
import { TreeService } from '../../../../../services/core/tree.service';

@Injectable({
  providedIn: 'root',
})
export class FrogTaskService {
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

  getFrogTasks(): TaskTreeNode[] | undefined {
    if (!this.settings || !this.tree) return undefined;

    return this.settings.frogTaskIds
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

  addFrogTask(taskId: string): void {
    if (!this.settings || this.settings.frogTaskIds.includes(taskId)) return;

    const updatedSettings = {
      ...this.settings,
      frogTaskIds: [...this.settings.frogTaskIds, taskId],
    };
    this.settingsService.updateSettings(updatedSettings);
  }

  removeFrogTask(taskId: string): void {
    if (!this.settings) return;

    const updatedSettings = {
      ...this.settings,
      frogTaskIds: this.settings.frogTaskIds.filter((id) => id !== taskId),
    };

    this.settingsService.updateSettings(updatedSettings);
  }

  toggleFrogTask(taskId: string): void {
    if (!this.settings) return;

    const updatedSettings = {
      ...this.settings,
    };

    if (this.settings.frogTaskIds.includes(taskId)) {
      updatedSettings.frogTaskIds = this.settings.frogTaskIds.filter(
        (id) => id !== taskId
      );
    } else {
      updatedSettings.frogTaskIds.push(taskId);
    }

    this.settingsService.updateSettings(updatedSettings);
  }
}
