import { Injectable } from '@angular/core';
import { TASK_CONFIG } from '../../app.config';
import { TaskTree } from '../../models/taskTree';
import { TreeCacheStrategy } from '../../models/service-strategies/tree-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class TreeCacheService implements TreeCacheStrategy {
  private cache: { tree: TaskTree; timestamp: number } | null = null;

  createTree(taskTree: TaskTree): void {
    this.addTree(taskTree);
  }

  /**
   * Add a task tree to the cache with a timestamp.
   */
  private addTree(tree: TaskTree): void {
    const timestamp = Date.now();
    this.cache = { tree, timestamp };
  }

  /**
   * Retrieve the task tree from the cache, removing it if expired.
   */
  getTree(): TaskTree | null {
    if (this.cache) {
      const isExpired =
        Date.now() - this.cache.timestamp > TASK_CONFIG.CACHE_EXPIRATION_MS;
      if (isExpired) {
        this.cache = null; // Clear expired cache
        console.log('Tree cache expired');
        return null;
      }
      return this.cache.tree;
    }
    return null;
  }

  /**
   * Update the task tree in the cache.
   */
  updateTree(tree: TaskTree): void {
    this.addTree(tree);
  }

  /**
   * Clear the cached task tree.
   */
  clearCache(): void {
    this.cache = null;
    console.log('Tree cache cleared');
  }
}
