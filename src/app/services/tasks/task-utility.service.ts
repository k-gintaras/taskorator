import { Injectable } from '@angular/core';
import { SelectedOverlordService } from '../task/selected-overlord.service';
import { TaskService } from './task.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { TreeService } from '../core/tree.service';
import {
  TaskTree,
  TaskTreeNode,
  TaskTreeNodeData,
} from '../../models/taskTree';
import { TreeNodeService } from '../core/tree-node.service';
import { TaskUsage, TaskUsageService } from './task-usage.service';
import { Observable, of, switchMap } from 'rxjs';

export interface TaskData {
  task: ExtendedTask | null;
  usage: TaskUsage | null;
  node: TaskTreeNodeData | null;
}
@Injectable({
  providedIn: 'root',
})
export class TaskUtilityService {
  constructor(
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private taskUsageService: TaskUsageService
  ) {}

  getSelectedOverlordId(): Observable<string | null> {
    return this.selectedOverlordService.getSelectedOverlordObservable();
  }

  async getTaskByName(name: string): Promise<ExtendedTask | null> {
    const taskTree: TaskTree | null = await this.treeService.getTreeOnce();
    if (!taskTree) return null;
    if (!taskTree.root) return null;
    const node: TaskTreeNode | null = this.treeNodeService.findNodeByName(
      taskTree.root,
      name
    );
    if (!node) return null;
    return this.taskService.getTaskById(node.taskId);
  }

  async getTaskData(id: string): Promise<TaskData | null> {
    const usage: TaskUsage | null = this.taskUsageService.getTaskUsage(id);
    const node: TaskTreeNodeData | null =
      this.treeService.getTaskTreeData(id) || null;
    const task: ExtendedTask | null = await this.taskService.getTaskById(id);
    const taskData: TaskData = { usage, node, task };
    if (!usage && !node && !taskData) return null;
    return taskData;
  }

  async getTaskById(id: string): Promise<ExtendedTask | null> {
    return this.taskService.getTaskById(id);
  }

  getSelectedOverlord(): Observable<ExtendedTask | null> {
    return this.selectedOverlordService.getSelectedOverlordObservable().pipe(
      switchMap((id) => {
        if (!id) {
          return of(null); // Return an observable of null if no ID is present
        }
        return this.taskService.getTaskById(id).then((task) => task); // Convert the Promise to an Observable
      })
    );
  }
}
