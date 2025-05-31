import { Injectable } from '@angular/core';
import { TreeNodeService } from '../tree/tree-node.service';
import { getDefaultScore } from '../../models/score';
import { getDefaultTaskSettings, TaskSettings } from '../../models/settings';
import {
  Task,
  getRootTaskObject,
  ROOT_TASK_ID,
  getDefaultTask,
} from '../../models/taskModelManager';
import { TaskTree, getDefaultTree } from '../../models/taskTree';
import { ApiStrategy } from '../../models/service-strategies/api-strategy.interface';
import { CacheOrchestratorService } from './cache-orchestrator.service';
import { RegistrationData } from '../../models/service-strategies/registration-strategy';
import { TaskUserInfo } from '../../models/service-strategies/user';

/**
 * Registration additional service
 * @example
 * const r = inject(RegistrationService);
 * r.registerUser(user: UserCredential);
 *
 * @remarks
 * Sets up all the data associated with user when registering
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  apiService: ApiStrategy | null = null;
  initialized: boolean = false;
  initialize(apiStrategy: ApiStrategy): void {
    this.apiService = apiStrategy;
    console.log('RegistrationService initialized with API strategy');
    this.initialized = true;
  }
  isInitialized() {
    return this.initialized;
  }
  private ensureApiService(): ApiStrategy {
    if (!this.apiService) {
      throw new Error('API service is not initialized.');
    }
    return this.apiService;
  }

  constructor(
    private treeNodeService: TreeNodeService,
    private cacheService: CacheOrchestratorService
  ) {}

  generateApiKey() {
    this.ensureApiService().generateApiKey();
  }

  getUserInfo(): Promise<TaskUserInfo | undefined> {
    return this.ensureApiService().getUserInfo();
  }

  updateUser(userInfo: TaskUserInfo) {
    return this.ensureApiService().updateUserInfo(userInfo);
  }

  async registerNewUser(): Promise<TaskUserInfo | null> {
    console.log('Attempting to register a new user...');
    let success = false;
    let attempts = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second delay
    let data: TaskUserInfo | null = null;

    while (!success && attempts < maxRetries) {
      try {
        console.log(`Register attempt ${attempts + 1} of ${maxRetries}`);
        data = await this.registerUser();
        if (data) {
          success = true;
          console.log('User registered successfully.');
        } else {
          console.warn('Registration returned null. Retrying...');
          attempts++;
          if (attempts < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms...`);
            await this.delay(retryDelay);
          }
        }
      } catch (error) {
        attempts++;
        console.error(
          `Unexpected error during registration (attempt ${attempts}):`,
          error
        );
        if (attempts < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await this.delay(retryDelay);
        }
      }
    }

    if (!success) {
      console.error(
        `All ${attempts} registration attempts failed. Deleting user.`
      );
      await this.deleteUser();
      return null;
    }

    return data;
  }

  /**
   * Helper method to introduce a delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async deleteUser(): Promise<void> {
    if (!this.apiService) return;
    return this.apiService.deleteUser();
  }

  async handleFailedRegistration(): Promise<void> {
    console.error('Deleting user due to failed registration.');
    await this.ensureApiService().deleteUser();
    throw new Error('Registration failed and user has been deleted.');
  }

  async registerUser(): Promise<TaskUserInfo | null> {
    const initialTask = this.getInitialTask();
    const additionalTasks = this.getAdditionalTasks(initialTask);
    const settings = this.getBaseSettings(initialTask.taskId);
    const score = this.getBaseScore();
    const tree = this.getBaseTree(initialTask);
    const userInfo: TaskUserInfo = {
      allowedTemplates: [],
      canCreate: false,
      canUseGpt: false,
      role: '',
      registered: false,
    };

    this.treeNodeService.createTasks(tree, additionalTasks);

    try {
      const registrationData: RegistrationData = {
        initialTask,
        additionalTasks,
        settings,
        score,
        tree,
        userInfo,
      };

      const registrationResult = await this.ensureApiService().register(
        registrationData
      );

      if (registrationResult.success) {
        await this.cacheService.createTask(initialTask);
        await Promise.all(
          additionalTasks.map((task) => this.cacheService.createTask(task))
        );
        await this.cacheService.createSettings(settings);
        await this.cacheService.createScore(score);
        await this.cacheService.createTree(tree);

        return userInfo; // Registration successful
      } else {
        console.warn('Registration failed:', registrationResult);
        return null; // Registration failed
      }
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      return null; // Registration failed
    }
  }

  private getInitialTask(): Task {
    const task = getRootTaskObject();
    task.taskId = ROOT_TASK_ID;
    return task;
  }

  private getAdditionalTasks(parent: Task): Task[] {
    const additionalTasks: Task[] = [
      getDefaultTask(),
      getDefaultTask(),
      getDefaultTask(),
    ];

    additionalTasks[0].name = 'Complete first task';
    additionalTasks[1].name = 'Try creating task';
    additionalTasks[2].name = 'Try moving task into subtask';

    // must create id for initial tasks, because it is easier to add it all and not wait API to return new ids,
    // in  the api we just create these ids too, and later we just use API ids
    additionalTasks[0].taskId = '121212';
    additionalTasks[1].taskId = '212121';
    additionalTasks[2].taskId = '313131';

    additionalTasks.forEach((t: Task) => {
      t.overlord = parent.taskId;
    });

    return additionalTasks;
  }

  private getBaseSettings(initialTaskId: string): TaskSettings {
    const baseSettings = getDefaultTaskSettings();
    baseSettings.lastOverlordViewId = initialTaskId;

    return baseSettings;
  }

  private getBaseScore() {
    return getDefaultScore();
  }

  private getBaseTree(initialTask: Task): TaskTree {
    const baseTree: TaskTree = getDefaultTree();
    baseTree.primarch.taskId = initialTask.taskId;
    baseTree.primarch.name = initialTask.name;
    return baseTree;
  }
}
