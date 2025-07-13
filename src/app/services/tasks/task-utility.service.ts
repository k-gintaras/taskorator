import { Injectable } from '@angular/core';
import { TaskService } from '../sync-api-cache/task.service';
import { UiTask } from '../../models/taskModelManager';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskNodeInfo } from '../../models/taskTree';
import { TaskUsage, TaskUsageService } from './task-usage.service';

export interface TaskData {
  task: UiTask | null;
  usage: TaskUsage | null;
  node: TaskNodeInfo | null;
}
@Injectable({
  providedIn: 'root',
})
export class TaskUtilityService {
  constructor(
    private taskService: TaskService,
    private treeService: TreeService,
    private taskUsageService: TaskUsageService
  ) {}

  async getTaskData(id: string): Promise<TaskData | null> {
    const usage: TaskUsage | null = this.taskUsageService.getTaskUsage(id);
    const node: TaskNodeInfo | null =
      this.treeService.getTaskTreeData(id) || null;
    const task: UiTask | null = await this.taskService.getTaskById(id);
    const taskData: TaskData = { usage, node, task };
    if (!usage && !node && !taskData) return null;
    return taskData;
  }

  async getTaskById(id: string): Promise<UiTask | null> {
    return this.taskService.getTaskById(id);
  }
}
