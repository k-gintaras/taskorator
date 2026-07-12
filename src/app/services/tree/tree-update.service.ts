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
    let helperTree = this.treeService.getLatestTree();
    if (!helperTree) {
      await this.treeService.fetchTree();
      helperTree = this.treeService.getLatestTree();
    }
    return helperTree;
  }

  async create(task: TaskoratorTask): Promise<void> {
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      await this.treeNodeService.createTasks(helperTree, [task]);
      // NOTE: local helper-tree patch only; parent-visit repair remains the durable sync point.
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.create failed', err);
    }
  }

  /**
   * @tip also updates if overlord change, moves node
   */
  async update(task: TaskoratorTask): Promise<void> {
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      await this.treeNodeService.updateTasks(helperTree, [task]);
      // NOTE: local helper-tree patch only; parent-visit repair remains the durable sync point.
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.update failed', err);
    }
  }

  async delete(taskId: string): Promise<void> {
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      await this.treeNodeService.deleteTasks(helperTree, [taskId]);
      // NOTE: local helper-tree patch only; parent-visit repair remains the durable sync point.
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.delete failed', err);
    }
  }

  async move(task: TaskoratorTask, newOverlordId: string | null): Promise<void> {
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      // Set desired overlord then call updateTasks which will perform the move.
      const copy = { ...task, overlord: newOverlordId } as TaskoratorTask;
      await this.treeNodeService.updateTasks(helperTree, [copy]);
      // NOTE: local helper-tree patch only; parent-visit repair remains the durable sync point.
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.move failed', err);
    }
  }

  /**
   * Update many tasks in the tree in a single operation and patch the local helper tree.
   * This avoids writing the whole tree document on every task mutation.
   */
  async updateTasksBatch(tasks: TaskoratorTask[]): Promise<void> {
    if (!tasks || !tasks.length) return;
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      await this.treeNodeService.updateTasks(helperTree, tasks);
      const parentIds = new Set<string>();
      for (const t of tasks) {
        parentIds.add(t.overlord || ROOT_TASK_ID);
      }
      this.treeNodeService.recountParentCounts(helperTree, parentIds);
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.updateTasksBatch failed', err);
    }
  }

  /**
   * Create many tasks in the tree in a single operation and patch the local helper tree.
   * Durable sync still happens later at explicit repair points.
   */
  async createTasksBatch(tasks: TaskoratorTask[]): Promise<void> {
    if (!tasks || !tasks.length) return;
    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) return;

    try {
      await this.treeNodeService.createTasks(helperTree, tasks);

      const parentIds = new Set<string>();
      for (const t of tasks) {
        parentIds.add(t.overlord || ROOT_TASK_ID);
      }
      this.treeNodeService.recountParentCounts(helperTree, parentIds);
      this.treeService.updateLocalTreeCache(helperTree);
    } catch (err) {
      console.error('TreeUpdateService.createTasksBatch failed', err);
    }
  }

  /**
   * Sync parent node children to match provided active tasks list.
   * This is the primary durable repair path: we reconcile tree from canonical
   * task truth when a parent's children are explicitly loaded.
   */
  async syncParentActiveChildren(
    parentId: string,
    activeTasks: TaskoratorTask[]
  ): Promise<{ changed: boolean; detachedIds: string[]; attachedIds: string[] }> {
    if (!parentId) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    const helperTree = await this.ensureTreeLoaded();
    if (!helperTree) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    const parent: TaskTreeNode | null =
      parentId === ROOT_TASK_ID
        ? helperTree.primarch
        : this.treeTools.findNodeById(helperTree.primarch, parentId);

    if (!parent) {
      return { changed: false, detachedIds: [], attachedIds: [] };
    }

    const activeIds = new Set(activeTasks.map((t) => t.taskId));
    const before = parent.children.map((c) => c.taskId);

    try {
      const toUpsert: TaskoratorTask[] = activeTasks.map((t) => ({
        ...t,
        overlord: parentId,
        stage: 'todo' as TaskStage,
      }));

      await this.treeNodeService.updateTasks(helperTree, toUpsert);

      const refreshedParent =
        parentId === ROOT_TASK_ID
          ? helperTree.primarch
          : this.treeTools.findNodeById(helperTree.primarch, parentId);

      if (!refreshedParent) {
        return { changed: false, detachedIds: [], attachedIds: [] };
      }

      const afterFiltered = refreshedParent.children.filter((c) => activeIds.has(c.taskId));
      const after = afterFiltered.map((c) => c.taskId);

      const detachedIds = before.filter((id) => !activeIds.has(id));
      const attachedIds = after.filter((id) => !before.includes(id));

      refreshedParent.children = afterFiltered;

      const changed = detachedIds.length > 0 || attachedIds.length > 0;

      if (changed) {
        this.treeNodeService.recountParentCounts(helperTree, new Set([parentId]));
        // This is one of the deliberate durable sync points.
        await this.treeService.updateTree(helperTree);
      }

      return { changed, detachedIds, attachedIds };
    } catch (err) {
      console.error('TreeUpdateService.syncParentActiveChildren failed', err);
      return { changed: false, detachedIds: [], attachedIds: [] };
    }
  }
}
