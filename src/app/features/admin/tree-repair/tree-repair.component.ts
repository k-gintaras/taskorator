import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { TaskTree } from '../../../models/taskTree';
import { UiTask } from '../../../models/taskModelManager';
import { ErrorService } from '../../../services/core/error.service';
import { TaskTreeHealService } from '../../../services/tree/task-tree-heal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TaskNavigatorComponent } from '../../../components/task-navigator/task-navigator.component';
import { TaskListSimpleService } from '../../../services/tasks/task-list/task-list-simple.service';
import { TaskListDataFacadeService } from '../../../services/tasks/task-list/task-list-data-facade.service';

@Component({
  selector: 'app-tree-repair',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TaskNavigatorComponent
  ],
  templateUrl: './tree-repair.component.html',
  styleUrls: ['./tree-repair.component.scss']
})
export class TreeRepairComponent implements OnInit {
  tree: TaskTree | null = null;
  abyssTasks: UiTask[] = [];
  isLoading = false;

  constructor(
    private treeService: TreeService,
    private taskService: TaskService,
    private errorService: ErrorService,
    private treeHealService: TaskTreeHealService,
    private taskListSimpleService: TaskListSimpleService,
    private taskListDataFacade: TaskListDataFacadeService
  ) {}
  overlordIdQuery = '';
  overlordTasks: UiTask[] = [];
  isQuerying = false;

  ngOnInit(): void {
    this.loadTree();
  }

  async loadTree(): Promise<void> {
    this.isLoading = true;
    try {
      this.tree = this.treeService.getLatestTree();

      if (!this.tree) {
        await this.treeService.fetchTree();
        this.tree = this.treeService.getLatestTree();
      }

      if (this.tree?.abyss?.length) {
        const ids = this.tree.abyss.map(node => node.taskId).slice(0, 10); // Limit to 10
        this.abyssTasks = await this.taskListSimpleService.getTasksByIds(ids) || [];
        // Add overlord names
        for (const task of this.abyssTasks) {
          if (task.overlord) {
            const overlordTask = await this.taskService.getTaskById(task.overlord);
            (task as any).overlordName = overlordTask?.name || 'Unknown';
          }
        }
        await this.taskListDataFacade.setTasks(this.abyssTasks);
      } else {
        this.abyssTasks = [];
        await this.taskListDataFacade.setTasks([]);
      }
    } catch (error) {
      this.errorService.error('Failed to load tree for repair');
    } finally {
      this.isLoading = false;
    }
  }

  async rebuildTree(): Promise<void> {
    this.isLoading = true;
    try {
      // Force a tree rebuild by fetching from API
      await this.treeService.fetchTree();
      await this.loadTree();
      this.errorService.feedback('Tree rebuilt successfully');
    } catch (error) {
      this.errorService.error('Failed to rebuild tree');
    } finally {
      this.isLoading = false;
    }
  }

  async forceHealTreeNow(): Promise<void> {
    try {
      const res = await this.treeHealService.forceHealTree();
      this.errorService.feedback(`Healed: ${res.missingTasksAdded} tasks, ${res.countsFixed} counts`);
      await this.loadTree();
    } catch (err) {
      this.errorService.error('Force heal failed');
    }
  }

}
  