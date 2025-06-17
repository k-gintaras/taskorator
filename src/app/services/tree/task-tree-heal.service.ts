import { Injectable } from '@angular/core';
import { TaskCacheService } from '../cache/task-cache.service';
import { TreeService } from '../sync-api-cache/tree.service';
import { EventBusService } from '../core/event-bus.service';
import { getDefaultTree, TaskTree } from '../../models/taskTree';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TreeNodeService } from './tree-node.service';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeHealService {
  private healingInProgress = false; // Track ongoing healing
  private healingTimeout: any = null; // Store the timeout for debounce
  private HEALING_DELAY = 500; // Delay in milliseconds

  constructor(
    private taskCache: TaskCacheService,
    private treeService: TreeService, // indirectly uses TaskTreeNodeToolsService
    private eventBusService: EventBusService,
    private treeNodeService: TreeNodeService // indirectly uses TaskTreeNodeToolsService
  ) {
    this.subscribeToEvents();
  }

  /**
   * Check if the tree needs healing.
   */
  treeNeedsHealing(tree: TaskTree): TaskoratorTask[] | null {
    const allTasks = this.taskCache.getAllTasks(); // Fetch all cached tasks
    const treeTasks = this.treeService.getFlattenedTree(tree); // Flattened list of tree nodes

    // we can't do it because cache will not always load all tasks...
    // // Quick check: Does the cache have more tasks than the tree?
    // if (treeTasks.length >= allTasks.length) {
    //   console.log('Tree has more tasks than the cache. Healing not needed.');
    //   return null;
    // }

    // Advanced check: Are there tasks in the cache that are not in the tree?
    const treeTaskIds = new Set(treeTasks.map((node) => node.taskId));
    const missingTasks = allTasks.filter(
      (task) => !treeTaskIds.has(task.taskId)
    );

    if (missingTasks.length > 0) {
      console.log(
        `Tree is missing ${missingTasks.length} tasks. Healing needed.`
      );
      return missingTasks;
    }

    console.log('Tree is healthy.');
    return null;
  }

  /**
   * Heal the tree if needed.
   */
  async healTreeIfNeeded(tree: TaskTree): Promise<boolean> {
    if (this.healingInProgress) {
      console.log('Healing already in progress. Skipping this invocation.');
      return false;
    }

    if (!tree) return false;

    const missingTasks = this.treeNeedsHealing(tree);
    if (missingTasks) {
      this.healingInProgress = true; // Mark healing as in progress
      console.log('Healing tree...');

      try {
        const createdTasks = await this.treeNodeService.createTasks(
          tree,
          missingTasks
        );

        if (createdTasks.length > 0) {
          console.warn('Tree updated with new tasks.');
          await this.treeService.updateTree(tree);
        }

        return true;
      } finally {
        this.healingInProgress = false; // Reset healing status
      }
    }

    return false; // No healing needed
  }

  /**
   * Subscribe to events for dynamic tree healing.
   */
  subscribeToEvents(): void {
    this.eventBusService
      .onEvent<TaskoratorTask[]>('getTasks')
      .subscribe((tasks) => {
        console.log('Tasks fetched event received.');

        if (this.healingTimeout) {
          clearTimeout(this.healingTimeout); // Clear existing timeout
        }

        this.healingTimeout = setTimeout(() => {
          const tree = this.treeService.getLatestTree();
          if (tree) {
            this.healTreeIfNeeded(tree).then((healed) => {
              if (healed) {
                console.log('Tree was healed after tasks fetched.');
              }
            });
          }
        }, this.HEALING_DELAY);
      });
  }
}
