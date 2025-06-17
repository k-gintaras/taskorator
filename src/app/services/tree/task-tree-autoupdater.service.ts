import { Injectable } from '@angular/core';
import { EventBusService } from '../core/event-bus.service';
import { TreeNodeService } from './tree-node.service';
import { ExtendedTask, TaskoratorTask } from '../../models/taskModelManager';
import { debounceTime, Subject } from 'rxjs';
import { OTHER_CONFIG } from '../../app.config';
import { TreeService } from '../sync-api-cache/tree.service';
import { TaskListKey } from '../../models/task-list-model';

@Injectable({
  providedIn: 'root',
})
export class TaskTreeAutoupdaterService {
  private updateQueue: Subject<void> = new Subject<void>();
  private isUpdating: boolean = false;

  constructor(
    private eventBusService: EventBusService,
    private treeNodeService: TreeNodeService, // uses TaskTreeNodeToolsService
    private taskTreeService: TreeService // uses TaskTreeNodeToolsService
  ) {
    this.subscribeToTaskEvents();
    this.setupUpdateQueue();
  }

  private subscribeToTaskEvents(): void {
    console.log('TaskTreeAutoupdaterService is listening for task events.');

    this.eventBusService.onEvent<any>('createTask').subscribe((task) => {
      this.handleCreateTask(task);
    });

    this.eventBusService.onEvent<any>('createTasks').subscribe((tasks) => {
      this.handleCreateTasks(tasks);
    });

    this.eventBusService.onEvent<any>('updateTask').subscribe((task) => {
      this.handleUpdateTask(task);
    });

    this.eventBusService.onEvent<any>('updateTasks').subscribe((tasks) => {
      this.handleUpdateTasks(tasks);
    });

    // this.tryHealTreeIfNeeded();
  }

  // private tryHealTreeIfNeeded() {
  //   if (OTHER_CONFIG.REPAIR_TREE) {
  //     this.eventBusService
  //       .onEvent<any>('getTasks')
  //       .subscribe(
  //         (tasksObject: {
  //           tasks: ExtendedTask[];
  //           taskListKey: TaskListKey;
  //         }) => {
  //           if (tasksObject.tasks) {
  //             this.healTree(tasksObject.tasks);
  //           }
  //         }
  //       );
  //     this.eventBusService
  //       .onEvent<any>('getTaskById')
  //       .subscribe((task: Task) => {
  //         if (task) {
  //           this.healTree([task]);
  //         }
  //       });
  //     this.eventBusService
  //       .onEvent<any>('getSuperOverlord')
  //       .subscribe((task: Task) => {
  //         if (task) {
  //           this.healTree([task]);
  //         }
  //       });
  //     this.eventBusService
  //       .onEvent<any>('getOverlordChildren')
  //       .subscribe((tasks: Task[]) => {
  //         if (tasks) {
  //           this.healTree(tasks);
  //         }
  //       });
  //   }
  // }

  // healTree(tasks: Task[]) {
  //   // const tree = this.taskTreeService.getLatestTree();
  //   // if (!tree) return;
  //   // this.treeNodeToolsService.healTreeTasks(tree, tasks).then((updated) => {
  //   //   if (updated) {
  //   //     this.taskTreeService.updateTree(tree).then();
  //   //   }
  //   // });
  // }

  private setupUpdateQueue(): void {
    this.updateQueue
      .pipe(debounceTime(OTHER_CONFIG.TREE_UPDATE_FREQUENCY))
      .subscribe(async () => {
        if (this.isUpdating) return; // Prevent overlapping updates
        this.isUpdating = true;

        try {
          const tree = this.taskTreeService.getLatestTree();
          if (tree) {
            await this.taskTreeService.updateTree(tree);
            console.log('Batched tree update completed successfully.');
          }
        } catch (error) {
          console.error('Error during batched tree update:', error);
        } finally {
          this.isUpdating = false;
        }
      });
  }

  private queueUpdate(): void {
    this.updateQueue.next();
  }

  private async handleCreateTask(task: TaskoratorTask): Promise<void> {
    if (!task) return;

    const tree = this.taskTreeService.getLatestTree();
    if (tree) {
      this.treeNodeService.createTasks(tree, [task]);
      this.queueUpdate(); // Queue a batched update
    }
  }

  private async handleCreateTasks(tasks: TaskoratorTask[]): Promise<void> {
    const tree = this.taskTreeService.getLatestTree();
    if (tree) {
      await this.treeNodeService.createTasks(tree, tasks);
      this.queueUpdate(); // Queue a batched update
    }
  }

  private async handleUpdateTask(task: TaskoratorTask): Promise<void> {
    const tree = this.taskTreeService.getLatestTree();
    if (tree) {
      await this.treeNodeService.updateTasks(tree, [task]);
      this.queueUpdate(); // Queue a batched update
    }
  }

  private async handleUpdateTasks(tasks: TaskoratorTask[]): Promise<void> {
    const tree = this.taskTreeService.getLatestTree();
    if (tree) {
      await this.treeNodeService.updateTasks(tree, tasks);
      this.queueUpdate(); // Queue a batched update
    }
  }
}
