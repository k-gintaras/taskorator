import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { TaskTree, TaskTreeNode } from '../../../models/taskTree';
import { UiTask, ROOT_TASK_ID } from '../../../models/taskModelManager';
import { ErrorService } from '../../../services/core/error.service';
import { TaskListService } from '../../../services/sync-api-cache/task-list.service';
import { TaskTreeHealService } from '../../../services/tree/task-tree-heal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface TreeRepairDisplayTask extends UiTask {
  parentName: string | null;
  parentId: string | null;
}

@Component({
  selector: 'app-tree-repair',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatChipsModule
    ,MatFormFieldModule,
    MatInputModule
    ,FormsModule
  ],
  templateUrl: './tree-repair.component.html',
  styleUrls: ['./tree-repair.component.scss']
})
export class TreeRepairComponent implements OnInit {
  tree: TaskTree | null = null;
  abyssTasks: TreeRepairDisplayTask[] = [];
  isLoading = false;

  constructor(
    private treeService: TreeService,
    private taskService: TaskService,
    private errorService: ErrorService,
    private taskListService: TaskListService,
    private treeHealService: TaskTreeHealService
  ) {}
  overlordIdQuery = '';
  overlordTasks: UiTask[] = [];
  isQuerying = false;

  ngOnInit(): void {
    this.loadTree();
  }

  async loadTree(): Promise<void> {
    this.isLoading = true;
    try {
      this.tree = this.treeService.getLatestTree();

      if (!this.tree) {
        await this.treeService.fetchTree();
        this.tree = this.treeService.getLatestTree();
      }

      if (this.tree?.abyss?.length) {
        this.abyssTasks = await Promise.all(
          this.tree.abyss.map(async (node) => {
            const task = await this.taskService.getTaskById(node.taskId);
            const parentId = task?.overlord ?? node.overlord ?? null;
            let parentName: string | null = null;

            if (parentId) {
              const parentTask = await this.taskService.getTaskById(parentId);
              parentName = parentTask?.name ?? null;
            }

            if (task) {
              return {
                ...task,
                parentId,
                parentName,
              } as TreeRepairDisplayTask;
            }

            return this.createPlaceholderTask(node, parentId, parentName);
          })
        );
      } else {
        this.abyssTasks = [];
      }
    } catch (error) {
      this.errorService.error('Failed to load tree for repair');
    } finally {
      this.isLoading = false;
    }
  }

  private createPlaceholderTask(
    node: TaskTreeNode,
    parentId: string | null,
    parentName: string | null
  ): TreeRepairDisplayTask {
    return {
      taskId: node.taskId,
      name: node.name,
      todo: 'Task data not found',
      why: '',
      timeCreated: 0,
      lastUpdated: 0,
      timeEnd: null,
    duration: 0,
    overlord: parentId,
      repeat: 'once',
      status: 'active',
      stage: node.stage,
      type: 'todo',
      subtype: '',
      size: 'do now',
      owner: '',
      priority: 5,
      backupLink: '',
      imageUrl: null,
      imageDataUrl: null,
      tags: [],
      isSelected: false,
      isRecentlyViewed: false,
      completionPercent: 0,
      color: '#e74c3c',
      views: 0,
      isRecentlyUpdated: false,
      isRecentlyCreated: false,
      children: node.childrenCount,
      completedChildren: node.completedChildrenCount,
      secondaryColor: '',
      magnitude: 0,
      isConnectedToTree: false,
      parentId,
      parentName
    };
  }

  async reconnectTask(task: TreeRepairDisplayTask, newParentId: string): Promise<void> {
    try {
      // Update the task's overlord
      task.overlord = newParentId;
      await this.taskService.updateTask(task);

      // Remove from abyss and update tree
      if (this.tree) {
        this.tree.abyss = this.tree.abyss.filter(node => node.taskId !== task.taskId);
        await this.treeService.updateTree(this.tree);
      }

      // Refresh the view
      await this.loadTree();
      this.errorService.feedback(`Reconnected ${task.name} to parent`);
    } catch (error) {
      this.errorService.error('Failed to reconnect task');
    }
  }

  async reattachTask(task: TreeRepairDisplayTask): Promise<void> {
    try {
      await this.treeService.addTaskToTree(task);
      await this.loadTree();
  this.errorService.feedback(`Reattached ${task.name} to recorded parent`);
    } catch (error) {
      this.errorService.error('Failed to reattach task to tree');
    }
  }

  getParentLabel(task: TreeRepairDisplayTask): string {
    if (!task.parentId) {
      return 'None';
    }
    return `${task.parentName || 'Unknown'} (${task.parentId})`;
  }

  get rootTaskId(): string {
    return ROOT_TASK_ID;
  }

  async rebuildTree(): Promise<void> {
    this.isLoading = true;
    try {
      // Force a tree rebuild by fetching from API
      await this.treeService.fetchTree();
      await this.loadTree();
      this.errorService.feedback('Tree rebuilt successfully');
    } catch (error) {
      this.errorService.error('Failed to rebuild tree');
    } finally {
      this.isLoading = false;
    }
  }

  getAbyssSummary(): string {
    if (!this.tree) return 'No tree data';
    return `${this.tree.abyss.length} tasks in abyss, ${this.tree.totalTasks} total tasks`;
  }
  
  async fetchOverlordTasks(): Promise<void> {
    if (!this.overlordIdQuery) return;
    this.isQuerying = true;
    try {
      const tasks = await this.taskListService.getOverlordTasks(
        this.overlordIdQuery
      );
      this.overlordTasks = tasks || [];
      // Ensure they're in tree if desired, but only show them here for admin review
    } catch (error) {
      this.errorService.error('Failed to fetch overlord tasks');
    } finally {
      this.isQuerying = false;
    }
  }

  async ensureOverlordInTree(): Promise<void> {
    if (!this.overlordTasks.length) return;
    try {
      // TreeService.accepts TaskoratorTask[], UiTask extends TaskoratorTask so this is safe
      await this.treeService.ensureTasksInTree(this.overlordTasks as any);
      await this.loadTree();
      this.errorService.feedback('Ensured overlord tasks are in the tree');
    } catch (error) {
      this.errorService.error('Failed to ensure overlord tasks in tree');
    }
  }

  async forceHealTreeNow(): Promise<void> {
    try {
      const res = await this.treeHealService.forceHealTree();
      this.errorService.feedback(`Healed: ${res.missingTasksAdded} tasks, ${res.countsFixed} counts`);
      await this.loadTree();
    } catch (err) {
      this.errorService.error('Force heal failed');
    }
  }

}
  