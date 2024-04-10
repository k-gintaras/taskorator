import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
// import ApiService from './api.service';
import {
  Task,
  getBaseTask,
  getDefaultTask,
} from 'src/app/models/taskModelManager';
import { Settings, getDefaultSettings } from 'src/app/models/settings';
import { getDefaultScore } from 'src/app/models/score';
import { TaskTree, getDefaultTree } from 'src/app/models/taskTree';
import { ConfigService } from './config.service';
import { CoreService } from './core.service';
import { TreeNodeService } from './tree-node.service';

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
export class RegistrationService extends CoreService {
  constructor(
    configService: ConfigService,
    private treeNodeService: TreeNodeService
  ) {
    super(configService);
  }

  async registerUser(user: UserCredential) {
    const userId = user.user?.uid;
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }

    this.registerUserById(userId);
  }

  async registerUserById(userId: string): Promise<boolean> {
    console.log('registering: ' + userId);
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }

    const initialTask = this.getInitialTask();
    const additionalTasks = this.getAdditionalTasks(initialTask);
    const settings = this.getBaseSettings(initialTask.taskId);
    const score = this.getBaseScore();
    const tree = this.getBaseTree(initialTask);
    this.treeNodeService.createTasks(tree, additionalTasks);

    console.log('additionalTasks 11111');
    console.log(additionalTasks);

    try {
      const registrationResult = await this.apiService.register(
        userId,
        initialTask,
        additionalTasks,
        settings,
        score,
        tree
      );

      if (registrationResult.success) {
        console.log(
          'User registered successfully:',
          registrationResult.success
        );

        await this.cacheService.createTask(initialTask);
        await Promise.all(
          additionalTasks.map((task) => this.cacheService.createTask(task))
        );
        await this.cacheService.createSettings(settings);
        await this.cacheService.createScore(score);
        await this.cacheService.createTree(tree);

        return true; // Registration successful
      } else {
        console.error('Registration failed:', registrationResult.message);
        return false; // Registration failed
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return false; // Registration failed
    }
  }

  private getInitialTask(): Task {
    const task = getBaseTask();
    task.taskId = '128';
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
    additionalTasks[0].taskId = '1';
    additionalTasks[1].taskId = '2';
    additionalTasks[2].taskId = '3';

    additionalTasks.forEach((t: Task) => {
      t.overlord = parent.taskId;
    });

    return additionalTasks;
  }

  private getBaseSettings(initialTaskId: string): Settings {
    const baseSettings = getDefaultSettings();
    baseSettings.lastOverlordViewId = initialTaskId;

    return baseSettings;
  }

  private getBaseScore() {
    return getDefaultScore();
  }

  private getBaseTree(initialTask: Task): TaskTree {
    const baseTree: TaskTree = getDefaultTree();
    baseTree.root.taskId = initialTask.taskId;
    baseTree.root.name = initialTask.name;
    return baseTree;
  }

  // async registerUser(user: UserCredential) {
  //   const userId = user.user?.uid;
  //   if (!userId) {
  //     throw new Error('No user id in user credentials @registerUser()');
  //   }

  //   this.registerUserById(userId);
  // }

  async registerUserById1(userId: string) {
    // TODO: pass this to api new method, to register as transaction
    // decide how we get default objects and where from
    // do we pass
    // do we get from api ?
    // pass... less rewriting, easier to change stuff later depending on "premoiun, not premium for example..."
    console.log('registering: ' + userId);
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }

    //TODO: initial task will be received with the whole thing
    // because without other stuff, it is worthless

    const initialTask = await this.createInitialTask(userId);
    const additionalTasks = await this.createAdditionalTasks(
      userId,
      initialTask
    );
    const settings = await this.createSettings(userId, initialTask.taskId);
    const score = await this.createScore(userId);
    const tree = await this.createTree(userId, initialTask);

    await this.cacheService.createTask(initialTask);
    await Promise.all(
      additionalTasks.map((task) => this.cacheService.createTask(task))
    );
    await this.cacheService.createSettings(settings);
    await this.cacheService.createScore(score);
    await this.cacheService.createTree(tree);
  }

  private async createInitialTask(userId: string): Promise<Task> {
    const apiService = this.configService.getApiStrategy();
    const task = await apiService.createTaskWithCustomId(
      userId,
      getBaseTask(),
      '128'
    );

    if (!task) {
      throw new Error('Could not create initial task @createInitialTask()');
    }

    return task;
  }

  private async createAdditionalTasks(
    userId: string,
    parent: Task
  ): Promise<Task[]> {
    const additionalTasks: Task[] = [
      getDefaultTask(),
      getDefaultTask(),
      getDefaultTask(),
    ];

    additionalTasks[0].name = 'Complete first task';
    additionalTasks[1].name = 'Try creating task';
    additionalTasks[2].name = 'Try moving task into subtask';

    additionalTasks.forEach((t: Task) => {
      t.overlord = parent.taskId;
    });

    const createdTasks = await this.apiService.createTasks(
      userId,
      additionalTasks
    );

    if (createdTasks.length !== additionalTasks.length) {
      throw new Error(
        'Could not create all additional tasks @createAdditionalTasks()'
      );
    }

    return createdTasks;
  }

  private async createSettings(userId: string, initialTaskId: string) {
    const baseSettings = getDefaultSettings();
    baseSettings.lastOverlordViewId = initialTaskId;
    const settings = await this.apiService.createSettings(userId, baseSettings);

    if (!settings) {
      throw new Error('Could not create settings @createSettings()');
    }

    return settings;
  }

  private async createScore(userId: string) {
    const score = await this.apiService.createScore(userId, getDefaultScore());

    if (!score) {
      throw new Error('Could not create score @createScore()');
    }

    return score;
  }

  private async createTree(userId: string, initialTask: Task) {
    const baseTree: TaskTree = getDefaultTree();
    baseTree.root.taskId = initialTask.taskId;
    baseTree.root.name = initialTask.name;
    const tree = await this.apiService.createTree(userId, baseTree);

    if (!tree) {
      throw new Error('Could not create tree @createTree()');
    }

    return tree;
  }
}
