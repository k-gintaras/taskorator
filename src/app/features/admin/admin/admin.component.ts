import { Component } from '@angular/core';
import { getBaseTemplate, TaskTemplate } from '../models/template';
import { AdminService } from '../services/admin.service';
import { NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../../services/task/task.service';
import { TreeService } from '../../../services/core/tree.service';
import { TreeNodeService } from '../../../services/core/tree-node.service';
import { testTemplate } from '../../../test-files/testTemplate';
import {
  getBaseTask,
  getDefaultTask,
  Task,
} from '../../../models/taskModelManager';
import { TaskTree } from '../../../models/taskTree';
import { LocalSqliteService } from '../services/local-sqlite.service';
import { TreeViewComponent } from '../../tree-view/tree-view.component';
import { TreeBuilderService } from '../services/tree-builder.service';
import { take } from 'rxjs';

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

  constructor(
    private templateService: AdminService,
    private taskService: TaskService,
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private localSqlite: LocalSqliteService,
    private treeBuilderService: TreeBuilderService
  ) {}

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
          this.taskService.createTasks(noRootTasks).then();
          this.taskService.getOverlordChildren('128').then((result) => {
            console.log('WHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT');
            console.log(result);
          });
        });

      // Create tasks for filtered tasks without a root
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
      await this.taskService.createTasks(tasks);
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
