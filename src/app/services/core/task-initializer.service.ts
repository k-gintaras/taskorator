import { Injectable } from '@angular/core';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { TreeNodeService } from '../tree/tree-node.service';
import { CacheOrchestratorService } from './cache-orchestrator.service';
import { getDefaultScore } from '../../models/score';
import { getDefaultTaskSettings } from '../../models/settings';
import { getRootTaskObject, ROOT_TASK_ID, getDefaultTask } from '../../models/taskModelManager';
import { getDefaultTree } from '../../models/taskTree';
import { TaskoratorTask } from '../../models/taskModelManager';

@Injectable({ providedIn: 'root' })
export class TaskInitializerService {
  constructor(
    private treeNodeService: TreeNodeService,
    private cacheService: CacheOrchestratorService
  ) {}

  /**
   * Initializes core user data: tasks, settings, score, and tree
   */
  async initializeUserData(api: ApiStrategy): Promise<void> {
    // Prepare data
    const initialTask = getRootTaskObject();
    initialTask.taskId = ROOT_TASK_ID;
    const additionalTasks: TaskoratorTask[] = [
      getDefaultTask(),
      getDefaultTask(),
      getDefaultTask(),
    ];
    additionalTasks[0].name = 'Complete first task';
    additionalTasks[1].name = 'Try creating task';
    additionalTasks[2].name = 'Try moving task into subtask';
    additionalTasks[0].taskId = '121212';
    additionalTasks[1].taskId = '212121';
    additionalTasks[2].taskId = '313131';

    const settings = getDefaultTaskSettings();
    const score = getDefaultScore();
    const tree = getDefaultTree();

    // Ensure all additional tasks are children of the root task
    additionalTasks.forEach(task => task.overlord = initialTask.taskId);
    // Create tree nodes and persist
    this.treeNodeService.createTasks(tree, additionalTasks);
    await api.createTask(initialTask);
    await Promise.all(additionalTasks.map((t) => api.createTask(t)));
    await api.createSettings(settings);
    await api.createScore(score);
    await api.createTree(tree);
  }
  
  /**
   * Orchestrates full registration for offline users: initialize data and register user info
   */
  async registerOfflineUser(api: ApiStrategy, registrationService: any): Promise<boolean> {
    // Initialize tasks, settings, score, and tree
    await this.initializeUserData(api);
    // Initialize registration service and register user
    registrationService.initialize(api);
    const result = await registrationService.registerNewUser();
    return result != null;
  }
}
