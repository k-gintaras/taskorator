import { Component, OnInit } from '@angular/core';
import { getDefaultSettings, TaskSettings } from '../../../models/settings';
import { SettingsService } from '../../../services/core/settings.service';
import { TreeService } from '../../../services/core/tree.service';
import { TaskTree, TaskTreeNode } from '../../../models/taskTree';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [NgFor],
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.scss',
})
export class FocusComponent implements OnInit {
  focusTasks: TaskTreeNode[] | undefined;
  settings: TaskSettings = getDefaultSettings();
  tree: TaskTree | undefined;

  constructor(
    private settingsService: SettingsService,
    private treeService: TreeService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) this.settings = s;
    });
    this.treeService.getTree().subscribe((t: TaskTree | null) => {
      if (t) {
        this.tree = t;
        this.loadFocusTasks();
      }
    });
  }

  // loadFocusTasks() {
  //   if (this.settings.focusTaskIds.length < 1) return;
  //   if (!this.tree) return;
  //   this.settings.focusTaskIds.forEach((id: string) => {
  //     // focusTasks.push...
  //   });
  // }

  // findTaskInTree(id: string) {
  //   //  ...TaskTreeNode
  //   // export interface TaskTreeNode {
  //   // name: string;
  //   // isCompleted: boolean;
  //   // taskId: string; // Assuming tasks are identified by string IDs, adjust as necessary
  //   // overlord: string | null; // The ID of the parent task, or null for the root
  //   // children: TaskTreeNode[]; // Array of child nodes
  //   // childrenCount: number; // The total number of direct children of this node
  //   // completedChildrenCount: number;
  // }

  updateSettings(updatedFields: Partial<TaskSettings>): void {
    this.settings = { ...this.settings, ...updatedFields };
    this.settingsService.updateSettings(this.settings);
  }

  addFocusTask(taskId: string): void {
    if (!this.settings.focusTaskIds.includes(taskId)) {
      this.updateSettings({
        focusTaskIds: [...this.settings.focusTaskIds, taskId],
      });
    }
  }

  removeFocusTask(taskId: string): void {
    this.updateSettings({
      focusTaskIds: this.settings.focusTaskIds.filter((id) => id !== taskId),
    });
  }

  loadFocusTasks() {
    if (this.settings.focusTaskIds.length < 1) return;
    const tree = this.tree;
    if (!tree) return;

    // Map and filter out undefined values in one go
    this.focusTasks = this.settings.focusTaskIds
      .map((id) => this.findTaskInTree(id, tree.root))
      .filter((task): task is TaskTreeNode => task !== undefined);
  }

  findTaskInTree(id: string, node: TaskTreeNode): TaskTreeNode | undefined {
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

  toggleFocus(taskId: string) {
    if (this.settings.focusTaskIds.length < 1) return;

    let settings = this.settings;
    if (settings.focusTaskIds.includes(taskId)) {
      settings.focusTaskIds = settings.focusTaskIds.filter(
        (id) => id !== taskId
      );
    } else {
      settings.focusTaskIds.push(taskId);
    }
    this.settingsService.updateSettings(settings);
    this.loadFocusTasks(); // Reload focus tasks based on the updated settings
  }
}
