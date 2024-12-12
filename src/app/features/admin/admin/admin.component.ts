import { Component } from '@angular/core';
import { getBaseTemplate, TaskTemplate } from '../models/template';
import { AdminService } from '../services/admin.service';
import { NgFor, NgIf } from '@angular/common';
import { TreeService } from '../../../services/core/tree.service';
import { TreeNodeService } from '../../../services/core/tree-node.service';
import {
  getBaseTask,
  getDefaultTask,
  Task,
} from '../../../models/taskModelManager';
import { TaskTree } from '../../../models/taskTree';
import { LocalSqliteService } from '../services/local-sqlite.service';
import { TreeBuilderService } from '../services/tree-builder.service';
import { take } from 'rxjs';
import { RegistrationService } from '../../../services/core/registration.service';
import { TaskUserInfo } from '../../../models/service-strategies/user';
import { GptRequestService } from '../../gpt/services/gpt-request.service';
import { AuthService } from '../../../services/core/auth.service';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  writeBatch,
  query,
  where,
  limit,
  orderBy,
  getDoc,
  setDoc,
  getDocs,
  runTransaction,
  DocumentReference,
  Timestamp,
  CollectionReference,
} from '@angular/fire/firestore';
import { testTemplate } from '../../../test-files/other-files/testTemplate';
import { TreeViewComponent } from '../../core/vortex/tree-view/tree-view.component';
import { TaskService } from '../../../services/tasks/task.service';
import { ApiFirebaseService } from '../../../services/core/api-firebase.service';
import { GeneralApiService } from '../../../services/api/general-api.service';
import { TaskListService } from '../../../services/tasks/task-list.service';
import { TaskBatchService } from '../../../services/tasks/task-batch.service';
import { TaskActions } from '../../../services/tasks/task-action-tracker.service';
/**
 * @deprecated This component/service is deprecated and will be removed in future releases.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgFor, TreeViewComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  message: string | null = null;
  template?: TaskTemplate;
  loading: boolean = false;
  error?: string;

  templateId: string = '';
  treeJson = '';
  tree: TaskTree | null = null;
  joke: string | null = null;

  constructor(
    private templateService: AdminService,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private taskBatchService: TaskBatchService,
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private localSqlite: LocalSqliteService,
    private treeBuilderService: TreeBuilderService,
    private registrationService: RegistrationService,
    private apiService: ApiFirebaseService,
    private apiBaseService: GeneralApiService,
    private gptService: GptRequestService,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  gptTest() {
    this.authService.getCurrentUserId().then((id) => {
      console.log(id);
      if (id) {
        const request = 'make joke about very big cat';
        this.gptService.makeGptRequest(request, id).then((result) => {
          this.joke = JSON.stringify(result, null, 2);
        });
      }
    });
  }
  registerTest() {
    const userId = 'qqpewpew';
    this.registrationService.registerUserById(userId);
  }

  getUserTest() {
    const userId = 'qqpewpew';
    // this.registrationService.registerUserById(userId);
    this.apiBaseService.getDocument(userId, 'userInfos').then((result: any) => {
      console.log(result);
    });
  }

  addDocTest() {
    const userId = '';
    const obj: TaskUserInfo = {
      allowedTemplates: [],
      canCreate: true,
      canUseGpt: true,
      role: 'admin',
      registered: true,
    };
    this.apiBaseService.createDocument(userId, 'userInfos', obj);
  }

  async migrateTasks() {
    try {
      const tasks = await this.templateService.fetchAllTasks();
      const newTemplate: TaskTemplate = {
        id: '', // Will be set by Firestore
        name: 'Ubaby Tasks',
        authorId: 'adminId',
        authorName: 'Ubaby',
        isPublic: false,
        tasks: tasks,
      };

      await this.templateService.createTemplateWithTasks(newTemplate);
      this.message = 'Template and tasks migrated successfully';
    } catch (error) {
      this.message = 'Failed to migrate tasks';
      console.error('Failed to migrate tasks:', error);
    }
  }

  parseDate(date: any): number | null {
    if (date === null) {
      return null;
    } else if (date instanceof Timestamp) {
      return date.toMillis(); // Firestore Timestamp
    } else if (typeof date === 'number') {
      return date; // Already in milliseconds
    } else if (typeof date === 'string') {
      if (!isNaN(Date.parse(date))) {
        return new Date(date).getTime(); // ISO 8601 or human-readable string
      } else if (!isNaN(Number(date))) {
        return Number(date); // String milliseconds
      } else {
        // Attempt to parse human-readable format, adjust format if needed
        return Date.parse(date.replace(' at', ''));
      }
    } else if (date instanceof Date) {
      return date.getTime(); // JavaScript Date object
    } else {
      throw new Error(`Unsupported date format: ${date}`);
    }
  }

  async migrateTaskDates(userId: string): Promise<void> {
    const tasksCollection = collection(
      this.firestore,
      `users/${userId}/tasks`
    ) as CollectionReference;
    const querySnapshot = await getDocs(tasksCollection);

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const updatedData = {
        ...data,
        timeCreated: this.parseDate(data['timeCreated']),
        lastUpdated: this.parseDate(data['lastUpdated']),
        timeEnd: this.parseDate(data['timeEnd']),
      };

      await setDoc(doc.ref, updatedData);
    });
  }

  migrateDatesFix(): void {
    this.authService
      .getCurrentUserId()
      .then((id) => {
        if (!id) throw new Error('no user');
        this.migrateTaskDates(id)
          .then(() => {
            console.log('Migration completed successfully.');
          })
          .catch((error) => {
            console.error('Error migrating dates:', error);
          });
      })
      .catch((error) => {
        console.error('Error getting user ID:', error);
      });
  }

  sqliteTest() {
    this.localSqlite.getTaskData().subscribe((tasks: Task[]) => {
      if (!tasks) {
        console.log('could not get tasks');
        return;
      }

      const filteredTasks = this.filterTasks(tasks);

      // Create tree from the fetched tasks
      const tree = this.treeBuilderService.createTree(filteredTasks);
      // this.tree = tree;

      // Subscribe to getTree() only once
      this.treeService
        .getTree()
        .pipe(take(1))
        .subscribe((oldTree: TaskTree | null) => {
          if (!oldTree) return;

          // Add the root tasks of the new tree to the old tree's root
          // oldTree.root.children.push(...tree.root.children);
          this.tree = oldTree;
          // Update the tree with the new tasks
          this.treeService.updateTree(oldTree).then();
          const noRootTasks = filteredTasks.filter((t) => t.taskId !== '128');
          this.taskBatchService.createTaskBatch(noRootTasks).then();
          this.taskListService
            .getOverlordTasks('128')
            .then((result: Task[] | null) => {
              console.log('WHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT');
              console.log(result);
            });
        });

      // Create tasks for filtered tasks without a root
    });
  }

  fixMissingTasks() {
    this.taskListService.getOverlordTasks('0').then((tasks: Task[] | null) => {
      this.taskService
        .getTaskById('vuLn7N0EOlUcYkz0ObX6')
        .then((task: Task | null) => {
          if (!tasks) return;
          if (!task) return;
          console.log(
            'task found ++++++++++++++++++++++++++++++++++++++++++++++++++++++'
          );

          tasks.forEach((t: Task) => {
            t.overlord = task.taskId;
          });
          this.taskBatchService.updateTaskBatch(tasks, TaskActions.MOVED);
          console.log(
            'TASKS FIXED AND UPDATED.................................................'
          );
        });
    });
  }

  private cleanTasks() {}

  private filterTasks(tasks: Task[]): Task[] {
    // remap parents

    // Find task with taskId === '128' and change it to '0'
    tasks.forEach((task) => {
      if (task.taskId === '128') {
        task.taskId = '0';
      }
    });

    // Find task with taskId === '129' and change it to '128'
    tasks.forEach((task) => {
      if (task.taskId === '129') {
        task.taskId = '128';
      }
    });

    // remap children
    // Find all tasks with task.overlord = '128' and set task.overlord = '129'
    tasks.forEach((task) => {
      if (task.overlord === '128') {
        task.overlord = '0';
      }
    });

    // Find all tasks with task.overlord = '129' and change them to '128'
    tasks.forEach((task) => {
      if (task.overlord === '129') {
        task.overlord = '128';
      }
    });

    return tasks;
  }

  async loadTemplate() {
    await this.loadTemplateWithId('Rap2DS0nPnXkrNDxRwB7');
  }

  async loadTemplateWithId(templateId: string) {
    this.loading = true;
    try {
      // Convert all timestamps in tasks
      const fetchedTemplate = this.createTaskTemplate(testTemplate);

      // const fetchedTemplate = await this.templateService.getTemplate(
      //   templateId
      // );
      if (fetchedTemplate) {
        this.template = fetchedTemplate;
        this.error = undefined;
        console.log(fetchedTemplate);
      } else {
        this.error = 'Template not found.';
      }
    } catch (err) {
      console.error('Failed to fetch template:', err);
      this.error = 'Failed to load template.';
    } finally {
      this.loading = false;
    }
  }

  convertTaskTimestamps(tasks: any[]): void {
    tasks.forEach((task) => {
      if (task.timeCreated && 'seconds' in task.timeCreated) {
        task.timeCreated = new Date(task.timeCreated.seconds * 1000);
      }
      if (task.timeEnd && 'seconds' in task.timeEnd) {
        task.timeEnd = new Date(task.timeEnd.seconds * 1000);
      }
      if (task.lastUpdated && 'seconds' in task.lastUpdated) {
        task.lastUpdated = new Date(task.lastUpdated.seconds * 1000);
      }
      // Add other date fields here as necessary
    });
  }

  normalizeTask(task: any): Task {
    return {
      timeCreated: new Date(task.timeCreated.seconds * 1000),
      timeEnd: task.timeEnd ? new Date(task.timeEnd.seconds * 1000) : null,
      lastUpdated: task.lastUpdated
        ? new Date(task.lastUpdated.seconds * 1000)
        : null,
      ...task,
    };
  }

  createTaskTemplate(data: any): TaskTemplate {
    return {
      tasks: data.tasks.map((task: any) => this.normalizeTask(task)),
      ...data,
    };
  }

  async copyTemplateTasks() {
    const template = await this.templateService.getTemplate(this.templateId);
    if (template) {
      const tasks = template.tasks.filter((task) => task.taskId !== '128');
      await this.taskBatchService.createTaskBatch(tasks);
      this.message = 'Tasks copied successfully, except the root task.';
    } else {
      this.message = 'Template not found.';
    }
  }

  getTree() {
    this.treeService.getTree().subscribe((tree) => {
      console.log(tree);
      if (tree) {
        console.log('Original Tree:', tree);
        this.tree = tree;
        if (tree) {
          const fetchedTemplate = this.createTaskTemplate(testTemplate);
          const testTasks = fetchedTemplate.tasks;
          // fix my old tasks...
          // root task Qn0lhaaruGjhk4W8UdnM doesnt exist anywhere
          // task.overlord===Qn0lhaaruGjhk4W8UdnM will get overlord 128
          // const defaultTask=getDefaultTask();
          // defaultTask.taskId=128
          // testTasks.push(defaultTask)

          // Reassign overlord for tasks with the missing overlord ID
          testTasks.forEach((task) => {
            if (task.overlord === 'Qn0lhaaruGjhk4W8UdnM') {
              task.overlord = '128'; // Reassign to the default root node
            }
          });
          const defaultTask = getDefaultTask();
          defaultTask.taskId = '128';
          testTasks.push(defaultTask);

          this.treeNodeService
            .createTasks(tree, testTasks)
            .then(() => {
              console.log('Updated Tree:', tree);
              // Optionally render the tree if you have a UI component to visualize it
              this.renderTree(tree);
            })
            .catch((error) => {
              console.error('Error adding tasks to the tree:', error);
            });
        }
      }
    });
  }

  renderTree(tree: TaskTree) {
    this.treeJson = JSON.stringify(tree, null, 2);
    this.tree = tree;
  }
}
