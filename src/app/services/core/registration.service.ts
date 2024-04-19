import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import {
  ROOT_TASK_ID,
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
        await this.cacheService.createTask(initialTask, 'registerUserById');
        await Promise.all(
          additionalTasks.map((task) =>
            this.cacheService.createTask(task, 'registerUserById')
          )
        );
        await this.cacheService.createSettings(settings);
        await this.cacheService.createScore(score);
        await this.cacheService.createTree(tree);

        return true; // Registration successful
      } else {
        return false; // Registration failed
      }
    } catch (error) {
      return false; // Registration failed
    }
  }

  private getInitialTask(): Task {
    const task = getBaseTask();
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
}
