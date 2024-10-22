import { Component, Input } from '@angular/core';
import { TaskSettings, getDefaultSettings } from '../../../models/settings';
import { Task } from '../../../models/taskModelManager';
import { ConfigService } from '../../../services/core/config.service';
import { SettingsService } from '../../../services/core/settings.service';
import { FilterService } from '../../../services/task/filter.service';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { SelectedOverlordService } from '../../../services/task/selected-overlord.service';
import { SortService } from '../../../services/task/sort.service';
import { RightMenuService } from '../../right-menu/services/right-menu.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { TaskMiniComponent } from '../../../components/task-mini/task-mini.component';
import { TaskActionComponent } from '../../../components/task/action/action.component';
import { PromoterComponent } from '../../../components/task/promoter/promoter.component';
import { SelectedMultipleComponent } from '../../../components/task/selected-multiple/selected-multiple.component';
import { GptCreateComponent } from '../../gpt/gpt-create/gpt-create.component';
import { GptTasksComponent } from '../../gpt/gpt-tasks/gpt-tasks.component';
import { RightMenuComponent } from '../../right-menu/right-menu/right-menu.component';
import { TaskNavigatorUltraService } from '../services/task-navigator-ultra.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FreshTaskService } from '../../../services/task/fresh-task.service';
import { ArtificerActionComponent } from '../../../components/task/artificer-action/artificer-action.component';
import { TaskTree, TaskTreeNodeData } from '../../../models/taskTree';
import { TreeService } from '../../../services/core/tree.service';
import { highlightRecentlyModifiedTask } from '../../../test-files/other-files/app.animations';
import { ArtificerComponent } from '../../../components/artificer/artificer.component';

@Component({
  selector: 'app-simple-navigator',
  standalone: true,
  imports: [
    MatCardModule,
    MatIcon,
    CommonModule,
    TaskMiniComponent,
    PromoterComponent,
    TaskActionComponent,
    SelectedMultipleComponent,
    RightMenuComponent,
    GptCreateComponent,
    GptTasksComponent,
    ArtificerActionComponent,
    ArtificerComponent,
  ],
  templateUrl: './simple-navigator.component.html',
  styleUrl: './simple-navigator.component.scss',
  animations: [highlightRecentlyModifiedTask],
})
export class SimpleNavigatorComponent {
  @Input() tasks: Task[] = [];
  @Input() showArtificer: boolean = false;
  settings: TaskSettings = getDefaultSettings();
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];
  freshTasks = new Map<string, boolean>();
  taskTree: TaskTree | undefined;

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private sortService: SortService,
    private filterService: FilterService,
    private taskNavigatorService: TaskNavigatorUltraService,
    private selectedOverlordService: SelectedOverlordService,
    private rightMenuService: RightMenuService,
    private settingsService: SettingsService,
    private freshTaskService: FreshTaskService,
    private treeService: TreeService,
    protected config: ConfigService
  ) {}

  ngOnInit() {
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });

    this.taskNavigatorService.getTaskNavigationView().subscribe((view) => {
      if (view) {
        this.selectedOverlord = view.taskOverlord;
        // we want to be able to return to the same view
        this.selectedOverlordService.setSelectedOverlord(view.taskOverlord);
        this.setNewFiltered(view.taskChildren);
      }
    });

    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) {
        this.settings = s;
      }
    });

    this.freshTaskService.getFreshTasks().subscribe((freshTasks) => {
      this.freshTasks = freshTasks;
    });

    this.treeService.getTreeOnce().then((tree: TaskTree | null) => {
      if (!tree) return;
      this.taskTree = tree;
    });
  }

  getTreeNodeData(task: Task): TaskTreeNodeData | undefined {
    return this.treeService.getTaskTreeData(task.taskId);
  }

  isShowMoreEnabled(): boolean {
    return this.rightMenuService.getIsShowMoreEnabled();
  }

  isTaskFresh(taskId: string): boolean {
    return this.freshTasks.get(taskId) || false;
  }

  async goBack(task: Task | undefined) {
    if (!task || !task.overlord) {
      this.errorNoTaskOrOverlord(task);
    } else {
      await this.taskNavigatorService.back(task);
    }
  }

  async onPrevious(task: Task | undefined) {
    if (!task || !task.overlord) {
      this.errorNoTaskOrOverlord(task);
    } else {
      await this.taskNavigatorService.previous(task);
    }
  }

  async onNext(task: Task) {
    if (!task || !task.taskId) {
      console.error('Invalid task or task ID provided.');
    } else {
      await this.taskNavigatorService.next(task);
    }
  }

  setNewFiltered(arr: Task[]) {
    this.tasks = arr;
    // daily tasks fail to show...

    if (this.settings) {
      this.tasks = this.filterService.filterBySettings(
        this.tasks,
        this.settings
      );
    }
    this.sortService.sortByPriority(this.tasks);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorNoTaskOrOverlord(task: Task | undefined) {
    this.log('No task or task overlord defined.');
  }

  log(s: string) {
    console.log(s);
  }

  errorNoChildrenInside() {
    this.log('No children inside this task.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorNoTasksOutside(task: Task | undefined) {
    this.log('No tasks above this task.');
  }

  isSelected(task: Task): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }
}
