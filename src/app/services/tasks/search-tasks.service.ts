import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { TreeNodeService } from '../tree/tree-node.service';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';

@Injectable({
  providedIn: 'root',
})
export class SearchTasksService {
  constructor(
    private treeService: TreeService,
    private treeNodeToolsService: TaskTreeNodeToolsService
  ) {}

  /**
   * Search tasks in the tree based on a query.
   * @param query - The search string to filter tasks by.
   * @returns An observable of filtered task nodes.
   */
  searchTasks(query: string): Observable<TaskTreeNode[]> {
    console.log('Searching tasks for query:', query);
    if (!query.trim()) {
      // Return an empty array if the query is empty
      return of([]);
    }

    return this.treeService.getTree().pipe(
      map((tree) => {
        if (!tree) {
          console.warn('Task tree is not available.');
          return [];
        }

        // Flatten the tree to make it searchable
        const flattenedTasks = this.treeNodeToolsService.getFlattened(tree);
        // Filter tasks based on the search query
        const lowerCaseQuery = query.toLowerCase();
        return flattenedTasks.filter((task) =>
          task.name?.toLowerCase().includes(lowerCaseQuery)
        );
      })
    );
  }
}
