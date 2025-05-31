import { Injectable } from '@angular/core';
import { SelectedOverlordService } from './selected-overlord.service';
import { TaskService } from '../sync-api-cache/task.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskNodeInfo } from '../../models/taskTree';
import { TaskUsage, TaskUsageService } from './task-usage.service';
import { Observable, of, switchMap } from 'rxjs';

export interface TaskData {
  task: ExtendedTask | null;
  usage: TaskUsage | null;
  node: TaskNodeInfo | null;
}
@Injectable({
  providedIn: 'root',
})
export class TaskUtilityService {
  constructor(
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private treeService: TreeService,
    private taskUsageService: TaskUsageService
  ) {}

  getSelectedOverlordId(): Observable<string | null> {
    return this.selectedOverlordService.getSelectedOverlordObservable();
  }

  async getTaskData(id: string): Promise<TaskData | null> {
    const usage: TaskUsage | null = this.taskUsageService.getTaskUsage(id);
    const node: TaskNodeInfo | null =
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
