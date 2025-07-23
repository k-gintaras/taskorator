import { Injectable } from '@angular/core';
import { TaskCacheService } from '../cache/task-cache.service';
import { TreeService } from '../sync-api-cache/tree.service';
import { EventBusService } from '../core/event-bus.service';
import { getDefaultTree, TaskTree, TaskTreeNode } from '../../models/taskTree';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TreeNodeService } from './tree-node.service';
import { TaskTreeNodeToolsService } from './task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeHealService {
  private healingInProgress = false;
  private healingTimeout: any = null;
  private HEALING_DELAY = 500; // Delay in milliseconds

  constructor(
    private taskCache: TaskCacheService,
    private treeService: TreeService,
    private eventBusService: EventBusService,
    private treeNodeService: TreeNodeService,
    private treeTools: TaskTreeNodeToolsService
  ) {
    this.subscribeToEvents();
  }

  /**
   * Check if the tree needs healing (missing tasks or wrong counts).
   */
  treeNeedsHealing(tree: TaskTree): {
    missingTasks: TaskoratorTask[];
    nodesWithWrongCounts: TaskTreeNode[];
  } {
    const allTasks = this.taskCache.getAllTasks();
    const treeTasks = this.treeService.getFlattenedTree(tree);

    // Check for missing tasks
    const treeTaskIds = new Set(treeTasks.map((node) => node.taskId));
    const missingTasks = allTasks.filter(
      (task) => !treeTaskIds.has(task.taskId)
    );

    // Check for nodes with wrong counts
    const nodesWithWrongCounts: TaskTreeNode[] = [];
    const allNodes = this.treeTools
      .flattenTree(tree.primarch)
      .concat(tree.abyss);

    for (const node of allNodes) {
      const actualChildrenCount = node.children.length;
      const actualCompletedCount = node.children.filter(
        (c) => c.stage === 'completed' || c.stage === 'deleted'
      ).length;

      if (
        node.childrenCount !== actualChildrenCount ||
        node.completedChildrenCount !== actualCompletedCount
      ) {
        nodesWithWrongCounts.push(node);
      }
    }
    return { missingTasks, nodesWithWrongCounts };
  }

  /**
   * Fix counts for specific nodes
   */
  private fixNodeCounts(nodes: TaskTreeNode[]): number {
    let fixedCount = 0;

    for (const node of nodes) {
      const actualChildrenCount = node.children.length;
      const actualCompletedCount = node.children.filter(
        (c) => c.stage === 'completed' || c.stage === 'deleted'
      ).length;

      if (
        node.childrenCount !== actualChildrenCount ||
        node.completedChildrenCount !== actualCompletedCount
      ) {
        node.childrenCount = actualChildrenCount;
        node.completedChildrenCount = actualCompletedCount;
        fixedCount++;
      }
    }

    return fixedCount;
  }

  /**
   * Heal the tree if needed (both missing tasks and wrong counts).
   */
  async healTreeIfNeeded(tree: TaskTree): Promise<boolean> {
    if (this.healingInProgress) {
      return false;
    }

    if (!tree) return false;

    const { missingTasks, nodesWithWrongCounts } = this.treeNeedsHealing(tree);

    if (missingTasks.length === 0 && nodesWithWrongCounts.length === 0) {
      return false;
    }

    this.healingInProgress = true;

    try {
      let treeChanged = false;

      // Add missing tasks
      if (missingTasks.length > 0) {
        const createdTasks = await this.treeNodeService.createTasks(
          tree,
          missingTasks
        );
        if (createdTasks.length > 0) {
          treeChanged = true;
        }
      }

      // Fix wrong counts
      if (nodesWithWrongCounts.length > 0) {
        const fixedCount = this.fixNodeCounts(nodesWithWrongCounts);
        if (fixedCount > 0) {
          treeChanged = true;
        }
      }

      // Update tree if anything changed
      if (treeChanged) {
        await this.treeService.updateTree(tree);
      }

      return treeChanged;
    } finally {
      this.healingInProgress = false;
    }
  }

  /**
   * Refresh specific tasks in the tree (update existing or add missing)
   */
  async refreshTasksInTree(tasks: TaskoratorTask[]): Promise<boolean> {
    // Validate input
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return false;
    }

    const tree = this.treeService.getLatestTree();
    if (!tree) {
      return false;
    }

    try {
      // Use updateTasks which handles both updates and creates
      const updatedTasks = await this.treeNodeService.updateTasks(tree, tasks);

      if (updatedTasks.length > 0) {
        // After updating tasks, check if any parent nodes need count fixes
        const parentIds = new Set<string>();
        for (const task of tasks) {
          if (task.overlord) {
            parentIds.add(task.overlord);
          }
        }

        // Fix counts for affected parents
        const parentsToFix: TaskTreeNode[] = [];
        for (const parentId of parentIds) {
          const parentNode = this.treeTools.findNodeById(
            tree.primarch,
            parentId
          );
          if (parentNode) {
            parentsToFix.push(parentNode);
          }
        }

        if (parentsToFix.length > 0) {
          this.fixNodeCounts(parentsToFix);
        }

        await this.treeService.updateTree(tree);
        return true;
      }
    } catch (error) {
      console.error('🏥 Error refreshing tasks in tree:', error);
    }

    return false;
  }

  /**
   * Subscribe to events for dynamic tree healing.
   */
  subscribeToEvents(): void {
    // Listen for overlord children being loaded
    this.eventBusService
      .onEvent<{ overlordId: string; children: TaskoratorTask[] }>(
        'overlord-children-loaded'
      )
      .subscribe(({ overlordId, children }) => {
        if (this.healingTimeout) {
          clearTimeout(this.healingTimeout);
        }

        this.healingTimeout = setTimeout(async () => {
          await this.fixParentBasedOnLoadedChildren(overlordId, children);
        }, this.HEALING_DELAY);
      });
  }

  /**
   * Simple fix: Update parent counts based on what we actually loaded
   */
  private async fixParentBasedOnLoadedChildren(
    overlordId: string,
    loadedChildren: TaskoratorTask[]
  ): Promise<void> {
    const tree = this.treeService.getLatestTree();

    if (!tree) {
      return;
    }

    // Find the parent node
    const parentNode = this.treeTools.findNodeById(tree.primarch, overlordId);
    if (!parentNode) {
      return;
    }

    // Simple counts from loaded data
    const actualChildrenCount = loadedChildren.length;
    const actualCompletedCount = loadedChildren.filter(
      (task) => task.stage === 'completed' || task.stage === 'deleted'
    ).length;

    // Update counts if different
    if (
      parentNode.childrenCount !== actualChildrenCount ||
      parentNode.completedChildrenCount !== actualCompletedCount
    ) {
      parentNode.childrenCount = actualChildrenCount;
      parentNode.completedChildrenCount = actualCompletedCount;
    }

    // Check for missing children in tree
    const childIdsInTree = new Set(parentNode.children.map((c) => c.taskId));
    const missingTasks = loadedChildren.filter(
      (task) => !childIdsInTree.has(task.taskId)
    );

    // Add missing tasks to tree if any
    if (missingTasks.length > 0) {
      await this.treeNodeService.updateTasks(tree, missingTasks);
    }

    // Clean up: remove children that shouldn't be there
    const loadedChildIds = new Set(loadedChildren.map((t) => t.taskId));
    parentNode.children = parentNode.children.filter((child) =>
      loadedChildIds.has(child.taskId)
    );

    // Save the tree
    await this.treeService.updateTree(tree);
  }

  /**
   * Manual healing trigger (for admin use)
   */
  async forceHealTree(): Promise<{
    missingTasksAdded: number;
    countsFixed: number;
  }> {
    const tree = this.treeService.getLatestTree();
    if (!tree) {
      throw new Error('No tree found');
    }

    const { missingTasks, nodesWithWrongCounts } = this.treeNeedsHealing(tree);

    let missingTasksAdded = 0;
    let countsFixed = 0;

    if (missingTasks.length > 0) {
      const created = await this.treeNodeService.createTasks(
        tree,
        missingTasks
      );
      missingTasksAdded = created.length;
    }

    if (nodesWithWrongCounts.length > 0) {
      countsFixed = this.fixNodeCounts(nodesWithWrongCounts);
    }

    if (missingTasksAdded > 0 || countsFixed > 0) {
      await this.treeService.updateTree(tree);
    }

    return { missingTasksAdded, countsFixed };
  }
}
