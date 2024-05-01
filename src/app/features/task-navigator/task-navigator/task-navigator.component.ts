import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskSettings, getDefaultSettings } from '../../../models/settings';
import { Task } from '../../../models/taskModelManager';
import { SettingsService } from '../../../services/core/settings.service';
import { FilterService } from '../../../services/task/filter.service';
import { PreviousService } from '../../../services/task/previous.service';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { SortService } from '../../../services/task/sort.service';
import { TaskNavigatorService } from '../services/task-navigator.service';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TaskMiniComponent } from '../../../components/task-mini/task-mini.component';
import { AddMoveTaskComponent } from '../../../components/add-move-task/add-move-task.component';
import { PromoterComponent } from '../../../components/task/promoter/promoter.component';
import { TaskActionComponent } from '../../../components/task/action/action.component';
import { SelectedMultipleComponent } from '../../../components/task/selected-multiple/selected-multiple.component';
import { SelectedOverlordService } from '../../../services/task/selected-overlord.service';
import { CoreService } from '../../../services/core/core.service';
import { ConfigService } from '../../../services/core/config.service';
import { RightMenuComponent } from '../../right-menu/right-menu/right-menu.component';
import { RightMenuService } from '../../right-menu/services/right-menu.service';
import { GptCreateComponent } from '../../gpt/gpt-create/gpt-create.component';
import { GptTasksComponent } from '../../gpt/gpt-tasks/gpt-tasks.component';
@Component({
  selector: 'app-task-navigator',
  standalone: true,
  templateUrl: './task-navigator.component.html',
  styleUrls: ['./task-navigator.component.scss'],
  imports: [
    MatCardModule,
    MatIcon,
    CommonModule,
    TaskMiniComponent,
    AddMoveTaskComponent,
    PromoterComponent,
    TaskActionComponent,
    SelectedMultipleComponent,
    RightMenuComponent,
    GptCreateComponent,
    GptTasksComponent,
  ], // Import MatCardModule directly here
})
export class TaskNavigatorComponent extends CoreService implements OnInit {
  tasks: Task[] = [];
  settings: TaskSettings = getDefaultSettings();
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];

  constructor(
    private selectedMultiple: SelectedMultipleService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private sortService: SortService,
    private filterService: FilterService,
    private previousService: PreviousService,
    private taskNavigatorService: TaskNavigatorService,
    private selectedOverlordService: SelectedOverlordService,
    private rightMenuService: RightMenuService,
    protected config: ConfigService
  ) {
    super(config);
  }

  ngOnInit() {
    // to let you come back from other components
    const restoredOverlord = this.selectedOverlordService.getSelectedOverlord();
    if (restoredOverlord) {
      this.selectedOverlord = restoredOverlord;
      this.loadTaskNavigationView(restoredOverlord.taskId);
    } else {
      // Fetch new data if no overlord is stored
      this.fetchInitialData();
    }

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
        this.tasks = view.taskChildren;
        this.setNewFiltered(this.tasks);
      }
    });
  }

  private fetchInitialData() {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) {
        this.settings = s;
        this.previousService
          .getPreviousOverlordId(this.route, this.settings)
          .then((overlordId: string | undefined) => {
            if (overlordId) {
              this.loadTaskNavigationView(overlordId);
            } else {
              console.log('could not load previous task');
            }
          });
      }
    });
  }

  isShowMoreEnabled(): boolean {
    return this.rightMenuService.getIsShowMoreEnabled();
  }

  private async loadTaskNavigationView(overlordId: string) {
    await this.taskNavigatorService.loadTaskNavigationView(overlordId);
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
