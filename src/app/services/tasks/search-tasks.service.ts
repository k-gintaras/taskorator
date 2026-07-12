import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';
import { TaskCacheService } from '../cache/task-cache.service';

@Injectable({
  providedIn: 'root',
})
export class SearchTasksService {
  constructor(
    private treeService: TreeService,
    private treeNodeToolsService: TaskTreeNodeToolsService,
    private taskCache: TaskCacheService
  ) {}

  /**
   * Search tasks using the helper tree when available.
   * Fallback to the current task cache because the tree is allowed to lag
   * behind recent task changes.
   */
  searchTasks(query: string): Observable<TaskTreeNode[]> {
    console.log('Searching tasks for query:', query);
    if (!query.trim()) {
      return of([]);
    }

    return this.treeService.getTree().pipe(
      map((helperTree) => {
        const lowerCaseQuery = query.toLowerCase();

        if (!helperTree) {
          console.warn('Task tree helper is not available. Falling back to task cache.');
          return this.searchCachedTasks(lowerCaseQuery);
        }

        const flattenedTasks = this.treeNodeToolsService.getFlattened(helperTree);
        const treeMatches = flattenedTasks.filter((task) =>
          task.name?.toLowerCase().includes(lowerCaseQuery)
        );

        if (treeMatches.length > 0) {
          return treeMatches;
        }

        // TODO: if cached results become noisy here, consider surfacing UI copy
        // that the helper tree may lag behind task truth after login/reload.
        return this.searchCachedTasks(lowerCaseQuery);
      })
    );
  }

  private searchCachedTasks(lowerCaseQuery: string): TaskTreeNode[] {
    return this.taskCache
      .getAllTasks()
      .filter((task) => task.name?.toLowerCase().includes(lowerCaseQuery))
      .map((task) => ({
        taskId: task.taskId,
        name: task.name,
        overlord: task.overlord,
        children: [],
        childrenCount: 0,
        completedChildrenCount: 0,
        connected: false,
        stage: task.stage,
      }));
  }
}
