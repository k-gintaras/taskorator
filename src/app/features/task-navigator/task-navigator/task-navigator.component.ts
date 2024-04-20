import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { completeButtonColorMap } from '../../../models/colors';
import {
  TaskSettings,
  getDefaultSettings,
  getButtonName,
} from '../../../models/settings';
import { Task } from '../../../models/taskModelManager';
import { SettingsService } from '../../../services/core/settings.service';
import { FilterService } from '../../../services/task/filter.service';
import { PreviousService } from '../../../services/task/previous.service';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { SelectedTaskService } from '../../../services/task/selected-task.service';
import { SortService } from '../../../services/task/sort.service';
import { TaskNavigatorService } from '../../../services/task/task-navigator.service';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { TaskObjectHelperService } from '../../input-to-tasks/services/task-object-helper.service';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TaskMiniComponent } from '../../../components/task-mini/task-mini.component';
import { AddMoveTaskComponent } from '../../../components/add-move-task/add-move-task.component';

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
  ], // Import MatCardModule directly here
})
export class TaskNavigatorComponent implements OnInit {
  tasks: Task[] = [];
  settings: TaskSettings = getDefaultSettings();
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];

  constructor(
    private taskUpdateService: TaskUpdateService,
    private taskObjectService: TaskObjectHelperService,
    private selectedMultiple: SelectedMultipleService,
    private selected: SelectedTaskService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private sortService: SortService,
    private filterService: FilterService,
    private previousService: PreviousService,
    private taskNavigatorService: TaskNavigatorService
  ) {}

  ngOnInit() {
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

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });

    this.taskNavigatorService.getTaskNavigationView().subscribe((view) => {
      if (view) {
        this.selectedOverlord = view.taskOverlord;
        this.tasks = view.taskChildren;
        this.setNewFiltered(this.tasks);
      }
    });
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
    console.log('No task or task overlord defined.');
  }

  errorNoChildrenInside() {
    console.log('No children inside this task.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorNoTasksOutside(task: Task | undefined) {
    console.log('No tasks above this task.');
  }

  onTaskCardClick(task: Task) {
    if (this.selectedTasks.indexOf(task) > -1) {
      this.selectedMultiple.removeSelectedTask(task);
    } else {
      this.selectedMultiple.addSelectedTask(task);
    }

    if (task) {
      this.selected.setSelectedTask(task);
    }
  }

  isSelected(task: Task): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }

  getOverlord(task: Task) {
    if (!this.tasks) return task;
    return this.taskObjectService.getOverlord(task, this.tasks);
  }

  complete(task: Task) {
    if (this.settings) {
      switch (this.settings.completeButtonAction) {
        case 'completed':
          console.log('completed ' + task.name);
          this.taskUpdateService.complete(task);
          break;
        case 'archived':
          console.log('archived ' + task.name);
          this.taskUpdateService.archive(task);
          break;
        case 'deleted':
          console.log('deleted ' + task.name);
          this.taskUpdateService.delete(task);
          break;
        case 'todo':
          console.log('todo ' + task.name);
          this.taskUpdateService.renew(task);
          break;
        case 'seen':
          console.log('seen ' + task.name);
          this.taskUpdateService.setAsSeen(task);
          break;
        default:
          break;
      }
    } else {
      console.error('Settings not loaded');
    }
  }

  addChild(task: Task) {
    this.onClickPlus(task);
  }

  promote(task: Task) {
    this.taskUpdateService.increasePriority(task);
  }

  demote(task: Task) {
    this.taskUpdateService.decreasePriority(task);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
  }

  getButtonName() {
    if (!this.settings) return 'Complete';
    return getButtonName(this.settings.completeButtonAction);
  }

  getColorBySetting() {
    if (!this.settings) return 'black';
    return (
      completeButtonColorMap[this.settings.completeButtonAction] || 'black'
    );
  }
}
