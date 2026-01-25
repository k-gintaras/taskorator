import { Injectable } from '@angular/core';
import { TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TaskoratorTask, ROOT_TASK_ID, TaskStage } from '../../models/taskModelManager';
import { TreeService } from '../sync-api-cache/tree.service';
import { TreeNodeService } from './tree-node.service';
import { TaskTreeNodeToolsService } from './task-tree-node-tools.service';

@Injectable({ providedIn: 'root' })
export class TreeUpdateService {
  constructor(
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private treeTools: TaskTreeNodeToolsService
  ) {}

  private async ensureTreeLoaded(): Promise<TaskTree | null> {
    let tree = this.treeService.getLatestTree();
    if (!tree) {
      await this.treeService.fetchTree();
      tree = this.treeService.getLatestTree();
    }
    return tree;
  }

  async create(task: TaskoratorTask): Promise<void> {
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      await this.treeNodeService.createTasks(tree, [task]);
      // Persist locally
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.create failed', err);
    }
  }

  /**
   * @tip also updates if overlord change, moves node
   */
  async update(task: TaskoratorTask): Promise<void> {
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      await this.treeNodeService.updateTasks(tree, [task]);
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.update failed', err);
    }
  }

  async delete(taskId: string): Promise<void> {
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      await this.treeNodeService.deleteTasks(tree, [taskId]);
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.delete failed', err);
    }
  }

  async move(task: TaskoratorTask, newOverlordId: string | null): Promise<void> {
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      // Set desired overlord then call updateTasks which will perform the move
      const copy = { ...task, overlord: newOverlordId } as TaskoratorTask;
      await this.treeNodeService.updateTasks(tree, [copy]);
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.move failed', err);
    }
  }

  /**
   * Update many tasks in the tree in a single operation and persist once.
   * Useful to avoid multiple expensive updates when processing batches.
   */
  async updateTasksBatch(tasks: TaskoratorTask[]): Promise<void> {
    if (!tasks || !tasks.length) return;
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      await this.treeNodeService.updateTasks(tree, tasks);
      // Recount parents for all affected tasks to keep counts correct
      const parentIds = new Set<string>();
      for (const t of tasks) {
        parentIds.add(t.overlord || ROOT_TASK_ID);
      }
      this.treeNodeService.recountParentCounts(tree, parentIds);
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.updateTasksBatch failed', err);
    }
  }

  /**
   * Create many tasks in the tree in a single operation and persist once.
   * Useful to avoid multiple expensive updates when processing batches.
   */
  async createTasksBatch(tasks: TaskoratorTask[]): Promise<void> {
    if (!tasks || !tasks.length) return;
    const tree = await this.ensureTreeLoaded();
    if (!tree) return;

    try {
      await this.treeNodeService.createTasks(tree, tasks);

      // Recount parents for all affected tasks to keep counts correct
      const parentIds = new Set<string>();
      for (const t of tasks) {
        parentIds.add(t.overlord || ROOT_TASK_ID);
      }
      this.treeNodeService.recountParentCounts(tree, parentIds);
      this.treeService.updateLocalTreeCache(tree);
    } catch (err) {
      console.error('TreeUpdateService.createTasksBatch failed', err);
    }
  }

  /**
   * Sync parent node children to match provided active tasks list.
   * Ensures nodes exist, sets their stage to 'todo', attaches them to parent,
   * and detaches children currently under parent that are not in activeTasks.
   */
  async syncParentActiveChildren(
    parentId: string,
    activeTasks: TaskoratorTask[]
  ): Promise<{ changed: boolean; detachedIds: string[]; attachedIds: string[] }> {
    if (!parentId) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    const tree = await this.ensureTreeLoaded();
    if (!tree) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    // Find parent node
    const parent: TaskTreeNode | null =
      parentId === ROOT_TASK_ID
        ? tree.primarch
        : this.treeTools.findNodeById(tree.primarch, parentId);

    if (!parent) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    const activeIds = new Set(activeTasks.map((t) => t.taskId));

    // Keep snapshot of before children
    const before = parent.children.map((c) => c.taskId);

    try {
      // Ensure nodes exist and are attached to parent: set overlord and stage and update
      const toUpsert: TaskoratorTask[] = activeTasks.map((t) => ({
        ...t,
        overlord: parentId,
        stage: 'todo' as TaskStage,
      }));

      await this.treeNodeService.updateTasks(tree, toUpsert);

      // Re-fetch parent to include possibly newly attached nodes
      const refreshedParent =
        parentId === ROOT_TASK_ID
          ? tree.primarch
          : this.treeTools.findNodeById(tree.primarch, parentId);

      if (!refreshedParent) {
        return { changed: false, detachedIds: [], attachedIds: [] };
      }

      // Detach anything currently under parent but not in activeIds
      const afterFiltered = refreshedParent.children.filter((c) => activeIds.has(c.taskId));
      const after = afterFiltered.map((c) => c.taskId);

      const detachedIds = before.filter((id) => !activeIds.has(id));
      const attachedIds = after.filter((id) => !before.includes(id));

      // Assign filtered children back to parent (detaching others)
      refreshedParent.children = afterFiltered;

      const changed = detachedIds.length > 0 || attachedIds.length > 0;

      if (changed) {
        // Recount parent counts for accuracy
        this.treeNodeService.recountParentCounts(tree, new Set([parentId]));
        // Persist locally
        this.treeService.updateLocalTreeCache(tree);
      }

      return { changed, detachedIds, attachedIds };
    } catch (err) {
      console.error('TreeUpdateService.syncParentActiveChildren failed', err);
      return { changed: false, detachedIds: [], attachedIds: [] };
    }
  }
}
